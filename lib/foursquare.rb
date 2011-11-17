class Foursquare

  include HTTParty

  base_uri 'https://api.foursquare.com/v2'
  follow_redirects true

  def search_venues_by_name_and_city name, city
    venues = []
    name, city = URI.escape(name), URI.escape(city)
    name.gsub! ' ', '+'
    city.gsub! ' ', '+'
    name.gsub! '%20', '+'
    city.gsub! '%20', '+'
    response = self.class.get("https://foursquare.com/search?q=#{name}&near=#{city}")
    doc = Nokogiri::HTML(response.body)
    if doc.css('#venueDetails').empty?
      doc.css('.searchResult .name a').each do |link|
        name = link.text
        path = link['href'].split('/') 
        foursquare_id = path[path.size - 1]
        venues << { :foursquare_id => foursquare_id, :name => name }
      end
    else
      path = doc.xpath("//meta").select {|meta| meta['property'] == 'og:url' }.first['content'].split('/') 
      foursquare_id = path[path.size - 1]
      name = doc.css('#venueDetails h1').text
      venues << { :foursquare_id => foursquare_id, :name => name }
    end
    return venues
  end

end
