get '/' do
  erb :index
end

get '/venues/search_by_name_and_city/:name/:city' do
  content_type :json
  Foursquare.new.search_venues_by_name_and_city(params[:name], params[:city]).to_json
end
