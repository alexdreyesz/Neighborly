import json

def find_top_needs(input_json='data/supply_demand_data.json'):
    sd_data = json.load(open(input_json))
    short_level_arr = [(sd_data['supply_demand_analysis'][i]['shortage_level'], sd_data['supply_demand_analysis'][i]['category']) for i in range(len(sd_data['supply_demand_analysis']))]
    short_level_arr.sort(key=lambda x: x[0], reverse=False)
    return set([cat for level, cat in short_level_arr if level != 0])

top_needs = find_top_needs()
print(top_needs)