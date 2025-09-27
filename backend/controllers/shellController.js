/**
 * Shell Controller
 * 
 * This controller handles shell command execution and management.
 * WARNING: This controller executes system commands and should be
 * properly secured in production environments.
 */

const { spawn } = require('child_process');
const { APIError } = require('../middleware/errorHandler');
const os = require('os');
const path = require('path');

// Mock command history store (replace with database in production)
let commandHistory = [];
let nextCommandId = 1;

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = {
  // File system commands
  'ls': ['-la', '-l', '-a', '-h'],
  'pwd': [],
  'whoami': [],
  'date': [],
  'uptime': [],
  'df': ['-h'],
  'free': ['-h'],
  'ps': ['aux'],
  'top': ['-n', '1'],
  'cat': [], // Limited to specific files only
  'head': ['-n'],
  'tail': ['-n'],
  'wc': ['-l', '-w', '-c'],
  'grep': ['-n', '-i', '-r'],
  'find': ['.', '-name', '-type'],
  'du': ['-h', '-s'],
  
  // Network commands (safe ones)
  'ping': ['-c', '1'],
  'curl': ['-I', '--max-time', '5'],
  'wget': ['--spider', '--timeout', '5'],
  
  // Git commands (if available)
  'git': ['status', 'log', '--oneline', 'branch', 'remote', '-v'],
  
  // Node.js specific
  'node': ['--version'],
  'npm': ['--version', 'list', '--depth', '0']
};

// Blacklist of dangerous commands
const BLACKLISTED_COMMANDS = [
  'rm', 'rmdir', 'del', 'rd',
  'format', 'fdisk', 'mkfs',
  'shutdown', 'reboot', 'halt',
  'sudo', 'su',
  'chmod', 'chown',
  'passwd', 'useradd', 'userdel',
  'kill', 'killall', 'pkill',
  'dd', '>', '>>', '|', '&', ';', '&&', '||',
  'eval', 'exec', 'system'
];

/**
 * Get list of available shell commands
 */
const getAvailableCommands = async (req, res) => {
  const commands = Object.keys(ALLOWED_COMMANDS).map(command => ({
    command,
    allowedFlags: ALLOWED_COMMANDS[command],
    description: getCommandDescription(command)
  }));

  res.json({
    commands,
    total: commands.length,
    note: 'Only whitelisted commands are allowed for security reasons'
  });
};

/**
 * Execute a shell command
 * WARNING: This is potentially dangerous - ensure proper security measures
 */
const executeCommand = async (req, res) => {
  const { command, timeout = 10000, workingDirectory } = req.body;

  if (!command) {
    throw new APIError('Command is required', 400);
  }

  // Validate command safety
  const validation = validateCommandSafety(command);
  if (!validation.isValid) {
    throw new APIError(`Command validation failed: ${validation.reason}`, 400);
  }

  // Set working directory (with safety checks)
  const workingDir = workingDirectory && path.isAbsolute(workingDirectory) 
    ? workingDirectory 
    : process.cwd();

  const commandId = nextCommandId++;
  const startTime = Date.now();

  try {
    // Parse command and arguments
    const [cmd, ...args] = command.trim().split(/\s+/);
    
    // Execute command
    const child = spawn(cmd, args, {
      cwd: workingDir,
      shell: true,
      timeout: timeout
    });

    let stdout = '';
    let stderr = '';
    let exitCode = null;

    // Collect stdout
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code) => {
      exitCode = code;
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Store command in history
      const commandRecord = {
        id: commandId,
        command,
        workingDirectory: workingDir,
        exitCode,
        stdout,
        stderr,
        duration,
        timestamp: new Date(),
        user: req.user?.id || 'anonymous' // In production, get from JWT
      };

      commandHistory.unshift(commandRecord);

      // Keep only last 100 commands in memory
      if (commandHistory.length > 100) {
        commandHistory = commandHistory.slice(0, 100);
      }

      res.json({
        id: commandId,
        command,
        workingDirectory: workingDir,
        exitCode,
        stdout,
        stderr,
        duration,
        timestamp: commandRecord.timestamp,
        success: exitCode === 0
      });
    });

    // Handle process errors
    child.on('error', (error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const commandRecord = {
        id: commandId,
        command,
        workingDirectory: workingDir,
        exitCode: -1,
        stdout: '',
        stderr: error.message,
        duration,
        timestamp: new Date(),
        user: req.user?.id || 'anonymous'
      };

      commandHistory.unshift(commandRecord);

      res.status(500).json({
        id: commandId,
        command,
        workingDirectory: workingDir,
        exitCode: -1,
        stdout: '',
        stderr: error.message,
        duration,
        timestamp: commandRecord.timestamp,
        success: false,
        error: 'Command execution failed'
      });
    });

    // Handle timeout
    setTimeout(() => {
      if (child && !child.killed) {
        child.kill('SIGTERM');
      }
    }, timeout);

  } catch (error) {
    throw new APIError(`Command execution failed: ${error.message}`, 500);
  }
};

/**
 * Get command execution history
 */
const getCommandHistory = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    user
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  let filteredHistory = commandHistory;

  // Filter by user if specified
  if (user) {
    filteredHistory = commandHistory.filter(cmd => cmd.user === user);
  }

  // Apply pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Calculate pagination metadata
  const totalCommands = filteredHistory.length;
  const totalPages = Math.ceil(totalCommands / limitNum);

  res.json({
    commands: paginatedHistory,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCommands,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      limit: limitNum
    }
  });
};

/**
 * Get details of a specific command execution
 */
const getCommandDetails = async (req, res) => {
  const { id } = req.params;
  const commandId = parseInt(id);

  if (isNaN(commandId)) {
    throw new APIError('Invalid command ID format', 400);
  }

  const command = commandHistory.find(cmd => cmd.id === commandId);
  
  if (!command) {
    throw new APIError('Command not found', 404);
  }

  res.json({
    command
  });
};

/**
 * Delete a command from history
 */
const deleteCommandHistory = async (req, res) => {
  const { id } = req.params;
  const commandId = parseInt(id);

  if (isNaN(commandId)) {
    throw new APIError('Invalid command ID format', 400);
  }

  const commandIndex = commandHistory.findIndex(cmd => cmd.id === commandId);
  
  if (commandIndex === -1) {
    throw new APIError('Command not found', 404);
  }

  const deletedCommand = commandHistory.splice(commandIndex, 1)[0];

  res.json({
    message: 'Command history deleted successfully',
    command: deletedCommand
  });
};

/**
 * Get system information (safe information only)
 */
const getSystemInfo = async (req, res) => {
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown'
    },
    network: {
      interfaces: Object.keys(os.networkInterfaces())
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      pid: process.pid,
      cwd: process.cwd()
    }
  };

  res.json({
    system: systemInfo,
    timestamp: new Date().toISOString()
  });
};

/**
 * Validate if a command is safe to execute
 */
const validateCommand = async (req, res) => {
  const { command } = req.body;

  if (!command) {
    throw new APIError('Command is required', 400);
  }

  const validation = validateCommandSafety(command);

  res.json({
    command,
    isValid: validation.isValid,
    reason: validation.reason,
    suggestions: validation.suggestions || []
  });
};

/**
 * Validate command safety
 */
function validateCommandSafety(command) {
  const trimmedCommand = command.trim();
  const [cmd, ...args] = trimmedCommand.split(/\s+/);

  // Check if command is blacklisted
  if (BLACKLISTED_COMMANDS.some(blacklisted => 
    cmd.toLowerCase().includes(blacklisted.toLowerCase())
  )) {
    return {
      isValid: false,
      reason: `Command '${cmd}' is not allowed for security reasons`
    };
  }

  // Check if command is in whitelist
  if (!ALLOWED_COMMANDS[cmd]) {
    return {
      isValid: false,
      reason: `Command '${cmd}' is not in the allowed commands list`,
      suggestions: Object.keys(ALLOWED_COMMANDS).filter(allowedCmd => 
        allowedCmd.startsWith(cmd.toLowerCase())
      )
    };
  }

  // Check if flags are allowed
  const allowedFlags = ALLOWED_COMMANDS[cmd];
  for (const arg of args) {
    if (arg.startsWith('-') && !allowedFlags.includes(arg)) {
      return {
        isValid: false,
        reason: `Flag '${arg}' is not allowed for command '${cmd}'`,
        suggestions: allowedFlags
      };
    }
  }

  return {
    isValid: true,
    reason: 'Command is safe to execute'
  };
}

/**
 * Get command description
 */
function getCommandDescription(command) {
  const descriptions = {
    'ls': 'List directory contents',
    'pwd': 'Print working directory',
    'whoami': 'Display current user',
    'date': 'Display current date and time',
    'uptime': 'Show system uptime',
    'df': 'Show disk space usage',
    'free': 'Show memory usage',
    'ps': 'Show running processes',
    'top': 'Show system processes',
    'cat': 'Display file contents',
    'head': 'Show first lines of file',
    'tail': 'Show last lines of file',
    'wc': 'Word count',
    'grep': 'Search text patterns',
    'find': 'Search for files',
    'du': 'Show directory sizes',
    'ping': 'Test network connectivity',
    'curl': 'Transfer data from/to server',
    'wget': 'Download files from web',
    'git': 'Git version control',
    'node': 'Node.js runtime',
    'npm': 'Node package manager'
  };

  return descriptions[command] || 'System command';
}

module.exports = {
  getAvailableCommands,
  executeCommand,
  getCommandHistory,
  getCommandDetails,
  deleteCommandHistory,
  getSystemInfo,
  validateCommand
};
