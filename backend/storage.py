

hospital_data = {}

def update_hospital_data(hospital_name, data):
    hospital_data[hospital_name] = data


def get_hospital_data(hospital_name):
    return hospital_name.data(hospital_name)


def get_all_hospitals():
    return hospital_data