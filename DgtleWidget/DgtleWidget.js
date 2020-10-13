// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: image;
/* jshint esversion: 6 */
// config setting
const widget_conf = {
  'small': {
    'day_font': 40,
    'header_font': 12,
    'content_font': 13,
    'footer_font': 13,
  },
  'medium': {
    'day_font': 40,
    'header_font': 12,
    'content_font': 13,
    'footer_font': 13,
  },
  'large': {
    'day_font': 50,
    'header_font': 12,
    'content_font': 13,
    'footer_font': 13,
  },
  'mask': 0.4, // mask opacity
  'jump_to_url': false, // jump to detail url by safari
}

const family = config.widgetFamily || 'large'

let index = args.widgetParameter || 0

if (!isNaN(index)) {
  index = parseInt(index, 10)
} else {
  index = 0
}

index = (index > 9 ? 0 : index)

let data = await loadDgtleItems(index)
let widget = await createWidget(data)

// present widget in app 
if (!config.runsInWidget) {
  await widget.presentLarge()
}

Script.setWidget(widget)
Script.complete()

// create widget
async function createWidget(data) {
  let widget = new ListWidget();
  if (widget_conf['jump_to_url']) {
    widget.url = 'https://m.dgtle.com/news-daily/' + data.id
  }
  let image = await getImage(data.cover)
  widget.backgroundImage = await shadowImage(image)
  widget = renderHeader(widget)
  widget.addSpacer(3)
  widget = renderContent(widget, data.content)
  widget = family == 'small' ? widget : renderFooter(widget, data.from)
  return widget
}

// render error
function renderError(widget) {
  let errorText = widget.addText('error parameter, should 0-9.')
  errorText.font = Font.mediumSystemFont(13)
  errorText.textColor = Color.red()
  return widget
}

// render header
function renderHeader(widget) {
  let date = new Date()
  let dateFormatter = new DateFormatter()
  dateFormatter.locale = "en"
  // day
  let dayStack = widget.addStack()
  dayStack.centerAlignContent()
  dateFormatter.dateFormat = "dd"
  let dayHeaderText = dayStack.addText(dateFormatter.string(date))
  dayHeaderText.font = Font.lightSystemFont(widget_conf[family].day_font)
  dayHeaderText.textColor = Color.white()
  dayStack.layoutHorizontally()
  dayStack.addSpacer(5)
  // mouth
  let mouthStack = dayStack.addStack()
  mouthStack.layoutVertically()
  dateFormatter.dateFormat = "MMM"
  let mouthHeaderText = mouthStack.addText(dateFormatter.string(date))
  mouthHeaderText.font = Font.lightSystemFont(widget_conf[family].header_font)
  mouthHeaderText.textColor = Color.white()
  mouthStack.addSpacer(2)
  // year
  dateFormatter.dateFormat = "y"
  let yearHeaderText = mouthStack.addText(dateFormatter.string(date))
  yearHeaderText.font = Font.lightSystemFont(widget_conf[family].header_font)
  yearHeaderText.textColor = Color.white()
  dayStack.addSpacer()
  return widget
}

// render content
function renderContent(widget, text) {
  let contentStack = widget.addStack()
  contentStack.layoutVertically()
  contentStack.centerAlignContent()
  family == 'large' ? contentStack.addSpacer() : ''
  let contentText = contentStack.addText(text)
  contentText.font = Font.mediumSystemFont(widget_conf.small.content_font)
  contentText.textColor = Color.white()
  family == 'large' ? contentStack.addSpacer(3) : contentStack.addSpacer()
  return widget
}

// render footer
function renderFooter(widget, author) {
  let footerStack = widget.addStack()
  footerStack.addSpacer()
  let footerText = footerStack.addText("———" + author)
  footerText.font = Font.mediumSystemFont(widget_conf[family].footer_font)
  footerText.textColor = Color.white()
  footerText.rightAlignText()
  return widget
}

async function loadDgtleItems(index = 0) {
  let listUrl = "https://opser.api.dgtle.com/v1/news/388"
  let listResult = new Request(listUrl)
  let list = await listResult.loadJSON()
  let detailUrl = "https://opser.api.dgtle.com/v1/news/detail/" + list.items[index].id
  let dataResult = new Request(detailUrl)
  let data = await dataResult.loadJSON()
  return data
}

async function shadowImage(img) {
  let ctx = new DrawContext()
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  ctx.setFillColor(new Color('#000000', 0.4))
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  return await ctx.getImage()
}

async function getImage(url) {
  let r = new Request(url)
  return await r.loadImage()
}