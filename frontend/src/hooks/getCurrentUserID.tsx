import supabase from '../config/supabaseClient'

const getCurrentUserID = async() => {

    const {data, error} = await supabase.auth.getUser();
    if (error){
        console.error("Error getting user: ", error.message);
        return null
    }
    if (data && data.user){
        const userId = data.user.id;
        console.log("Current user ID:", userId)
        return userId
    }else {
        console.log("No logged in user detected")
        return null
    }

};

export default getCurrentUserID()