path = File.expand_path(File.join(File.dirname(__FILE__)))
$LOAD_PATH << path

require 'rubygems'
require 'bundler'
Bundler.require :default

require 'yaml'

CONFIG = YAML.load_file('config/env.yml')[Sinatra::Application.environment.to_s]

Twitter.configure do |config|
  config.consumer_key = CONFIG['twitter_consumer_key']
  config.consumer_secret = CONFIG['twitter_consumer_secret']
end

TWITTER_CREDENTIALS = [{
  :consumer_key =>'47SOyTBpmqI7a9LHSIoiAg',
  :consumer_secret => '0q6WEECClR8rLGBrBsU8njqmPBTRZHwb24fIbvQk',
  :oauth_token => '15903657-RNusGPmGa8AlYTSydZJOm9k9yEhUzOMcXFsDJnAlc',
  :oauth_token_secret => 'FthwBXAO4cov0hiyV4wzKufClyUHpgFq19kQIWvtU'
}, {
  :consumer_key =>'Q2Q4M2zZ7Yz9HE9q42bg',
  :consumer_secret => 'Ty7FsGva3WFlgtaY9QQIvceV013fWETbOeOpqG5pIo',
  :oauth_token => '15903657-oTYJzhoRUlJFEoARlo6Axli32zndYzP9IMyg0oGjc',
  :oauth_token_secret => '0LzCsYaSNdo9hqvvMIfhc7gYFksrG56g8OmWpbe7mvE'
}, {
  :consumer_key => '1w8gqBenHnBQ01e1VGwlw',
  :consumer_secret => '4tUzQzwZfNyCTJlFiuVyrV27mMphHUM2CJK8m9YzY',
  :oauth_token => '15903657-r4x7DZdP3le7DrOqBV1xzml83IHrwVUf8uT87o39m',
  :oauth_token_secret => '8WchwvqdSMc6DdmxTRvIlV03yutScIRSZStKLliwo'
}, {
  :consumer_key => 'FZxNrVz9H4mWfPm4xSiDQ',
  :consumer_secret => 'ZREGxMcgIhDFWHxu9XJcwYKQkXZ2jghs57onbAC5I',
  :oauth_token => '15903657-JRGCLmU3xmBCKIspoex9BhYzivuVGHO0i2bVeR8Wd',
  :oauth_token_secret => 'olXorHylf4vwD29VvyuABwIi7EwcX3VqK5oOhafL1k'
}, {
  :consumer_key => '20GIySZn4BUFaMJiLAMkg',
  :consumer_secret => 'r3CDuv6laSLGqx9JeAOhK4pevW1GY5285ubE98zayM',
  :oauth_token => '15903657-eOEXbbA81ajGW3S9mi999B4ZOZgd0umAmGrallHmh',
  :oauth_token_secret => 'tTWrDhwvQWdQm3xn4pMltLzO7Tmyhevapo4YsD3wd5k'
}, {
  :consumer_key => 'pALeImuyXIIZrFLxqxCxw',
  :consumer_secret => 'K4g96NAKiDsbbZM4Uo0LJMS0wUohbjNt6cCekA8gFBc',
  :oauth_token => '15903657-lDwBQenZ4W0WFwmH75htk86PjXmaEtlWMuqFPXcNF',
  :oauth_token_secret => 'DvfUbHugoVt8JuaQTmUppO03kxKlIzVc4IQ0vAHwZ4'
}, {
  :consumer_key => 'k7MgQLT074yM9Q3gqOMYw',
  :consumer_secret => 'PDxFOW23U9xMarx16HluZKJYQFodsMhfA7QC3Yjc',
  :oauth_token => '15903657-rarYyIUgGzKAY5obQaVDoSyErnlGeThUWUY9IJZx6',
  :oauth_token_secret => 'VFMTxcFC1SsDMS2S9HGYcRZAG0HJ8l4DoagDjfKHK8'
}]

set :app_file, __FILE__

Dir['lib/**/*.rb'].each { |file| require file }
