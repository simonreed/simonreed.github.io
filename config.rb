require 'active_support/core_ext'
require 'kramdown'

###
# Blog settings
###

# Time.zone = "UTC"

activate :blog do |blog|
  # This will add a prefix to all links, template references and source paths
  # blog.prefix = "blog"

  # Matcher for blog source files
  blog.sources = "{category}/{title}.html"
  blog.permalink = "/{category}/{title}"
  # blog.taglink = "tags/{tag}.html"
  blog.layout = "post"
  # blog.summary_separator = /(READMORE)/
  # blog.summary_length = 250
  # blog.year_link = "{year}.html"
  # blog.month_link = "{year}/{month}.html"
  # blog.day_link = "{year}/{month}/{day}.html"
  # blog.default_extension = ".markdown"

  blog.tag_template = "tag.html"
  blog.calendar_template = "calendar.html"

  # Enable pagination
  # blog.paginate = true
  # blog.per_page = 10
  # blog.page_link = "page/{num}"
end

activate :directory_indexes

page "/404.html", :directory_index => false

page "/feed.xml", layout: false

###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", layout: false
#
# With alternative layout
# page "/path/to/file.html", layout: :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

###
# Helpers
###

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
# activate :livereload

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

data.categories.each do |category|
  proxy "/#{category.first}.html", "guide.html", :locals => { :id => category.first }, :ignore => true
end

helpers do
  def nav_active(page)
    if current_page.data.navigation == page
      "active"
    end
  end

  def category_articles(category)
    blog.articles.select do |article|
       (article.data.published.nil? || article.data.published != false)  && article.data.category == category
    end
  end

  def category_top_articles(category)
    category_articles(category.id).select do |article|
      category.top_posts.include?( article.slug )
    end
  end

  def current_category
    OpenStruct.new(data.categories[current_page.data.category])
  end

  def categories
    @categories ||= data.categories.map do |k,v|
      OpenStruct.new(v.merge(:id => k))
    end
  end

  def find_category(id)
    OpenStruct.new(data.categories[id].merge(:id => id))
  end

  def other_category(id)
    other_keys = data.categories.keys.reject{|k| k == id}
    other_id = other_keys.sample
    return unless data.categories[other_id]
    OpenStruct.new(data.categories[other_id].merge(:id => other_id))
  end

  def formatted_date(date)
      date_obj = Date.parse( date.to_s )
      date_obj.strftime("#{date.day.ordinalize} %b %Y")
  end

  def parse_markdown(text)
    Kramdown::Document.new(text).to_html
  end
end

set :css_dir, 'css'

set :js_dir, 'js'

set :images_dir, 'img'

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

# github deploy
activate :deploy do |deploy|
  deploy.method = :git
  deploy.build_before = true
  deploy.branch   = "master"
  deploy.remote   = "git@github.com:simonreed/simonreed.github.io.git"
end
