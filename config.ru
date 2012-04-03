path = File.expand_path(File.join(File.dirname(__FILE__)))
$LOAD_PATH << path

require 'fourbongo'
run Sinatra::Application

