require 'rubygems'
require 'bundler'
Bundler.require :default

set :app_file, __FILE__

Dir['lib/**/*.rb'].each { |file| require file }
