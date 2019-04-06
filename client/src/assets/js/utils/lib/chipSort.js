const keySort = {
  'color': 2,
  'country': 3,
  'driven_form': 4,
  'seat_count': 5,    
  'body_detail_type': 6,
  'capacity_l': 7,
  'car_mileage': 8,    
  'car_age': 9,    
  'gearbox_type': 10,    
  'series_type': 11, 
  'series_id': 12,   
  'brand_id': 13,
}

export function chipSort(a, b){
  return keySort[a] - keySort[b] < 0 ? 1 : -1;
}