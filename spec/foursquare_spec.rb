require 'spec/spec_helper'

describe Foursquare do
  let (:foursquare) { Foursquare.new }

  context 'searching venue by city and location' do
    context 'one match' do
      use_vcr_cassette 'foursquare_venues_search_by_name_and_city_one_match', :record => :new_episodes
      before { @venues = foursquare.search_venues_by_name_and_city 'ThoughtWorks', 'Porto Alegre'}
      it 'should retrieve nearby venues' do
        @venues.first.should == { :foursquare_id => '4d2cad07d86aa090493324c0', :name => 'ThoughtWorks Brazil' }
      end
    end
    context 'several matches' do
      use_vcr_cassette 'foursquare_venues_search_by_name_and_city_multiple_matches', :record => :new_episodes
      before { @venues = foursquare.search_venues_by_name_and_city 'cachorro-quente', 'Porto Alegre'}

      it 'should retrieve nearby venues' do
        @venues.first.should == { :foursquare_id => '4b8d5108f964a52011f432e3', :name => 'Cachorro do Rosário' }
      end
    end
  end

end
