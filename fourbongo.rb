path = File.expand_path(File.join(File.dirname(__FILE__)))
$LOAD_PATH << path

require 'rubygems'
require 'bundler'
Bundler.require :default

require 'yaml'

CONFIG = YAML.load_file('config/env.yml')[Sinatra::Application.environment.to_s]

set :app_file, __FILE__

Dir['lib/**/*.rb'].each { |file| require file }
