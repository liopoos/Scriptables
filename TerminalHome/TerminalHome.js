// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: terminal;
const widget_conf = {
  'user': 'hades',
  'last_login': getOrSetLastLogin(),
  'prefix': 'user@{user}:~ $ ',
}

const family = config.widgetFamily || 'large' // widget size

let order_list = {
  'start': {
    'order': '',
    'family': ['small', 'medium', 'large'],
    'color': '#999999',
    'text': widget_conf.last_login,
  },
  'date': {
    'order': 'date',
    'family': ['small', 'medium', 'large'],
    'color': '#ffa7d3',
    'text': getDate(),
  },
  'battery': {
    'order': 'battery --graph',
    'family': ['small', 'medium', 'large'],
    'color': '#ffcc66',
    'text': getBattery(),
  },
  'info': {
    'order': 'info',
    'family': ['large'],
    'color': '#356EA7',
    'text': getDeviceInfo(),
  },
  'sleep': {
    'order': 'sleep -u ' + widget_conf.user,
    'family': ['medium', 'large'],
    'color': '#7dbbae',
    'text': getSleepData(),
  },
  'calendar': {
    'order': 'calendar -H',
    'family': ['large'],
    'color': '#ff9468',
    'text': await getCalendarNum(),
  },
  'calendar-event': {
    'order': '',
    'family': ['large'],
    'color': '#ff9468',
    'text': await getCalendarEvent(),
  },
}

let widget = createWidget()

// present widget in app 
if (!config.runsInWidget) {
  await widget.presentLarge()
}

Script.setWidget(widget)
Script.complete()

function createWidget() {
  let widget = new ListWidget()
  if (family == 'small') {
    return renderSmall(widget)
  }
  widget.setPadding(0, 0, 0, 0)
  widget.backgroundColor = new Color('#1B1C1E')
  widget = renderHeader(widget)
  widget.addSpacer(5)
  widget = renderContent(widget)
  widget.addSpacer()
  getOrSetLastLogin(1) // save last_login data
  return widget
}
// render small 
function renderSmall(widget) {
  let samllStack = widget.addStack()
  let errorText = samllStack.addText('please use 4x2 or 4x4 widget.')
  errorText.font = new Font('Menlo', 10)
  errorText.textColor = Color.white()
  return widget
}

// render header
function renderHeader(widget) {
  let barStack = widget.addStack()
  barStack.size = new Size(0, 36)
  barStack.backgroundColor = new Color('#2B2C2E')
  // draw a window bar
  let buttonStack = barStack.addStack()
  let buttonSize = new Size(80, 36)
  buttonStack.size = buttonSize
  buttonStack.backgroundImage = drawBar(buttonSize)
  barStack.addSpacer()
  return widget
}

// render content
function renderContent(widget) {
  let infoStack = widget.addStack()
  infoStack.layoutVertically()
  infoStack.setPadding(0, 10, 0, 10)
  infoStack.spacing = 4
  let orderText, replyText
  let orderColor = new Color('#999999')
  // add each info
  for (let i in order_list) {
    if (inArray(order_list[i].family)) {
      if (order_list[i].order) {
        orderText = infoStack.addText(joinOrderText(order_list[i].order))
        orderText.font = new Font('Menlo', 10)
        orderText.textColor = orderColor
      }
      replyText = infoStack.addText(order_list[i].text)
      replyText.font = new Font('Menlo', 10)
      replyText.textColor = new Color(order_list[i].color || orderColor)
    }
  }
  return widget
}

// draw a MacOS windows bar
function drawBar(size) {
  let ctx = new DrawContext()
  let ellipse = {
    width: 12,
    height: 12
  }
  let color = ['#FC5B57', '#E5BF3C', '#57C038']
  ctx.size = size
  ctx.opaque = false
  ctx.respectScreenScale = true
  for (let i in color) {
    ctx.setFillColor(new Color(color[i]))
    ctx.fillEllipse(new Rect(15 + i * 18, 12, ellipse.width, ellipse.height))
  }
  return ctx.getImage()
}

// add date
function getDate(onlyDate = 1) {
  let date = new Date()
  let dateFormatter = new DateFormatter()
  dateFormatter.locale = 'en'
  let time = ''
  if (onlyDate) {
    dateFormatter.useFullDateStyle()
    dateFormatter.useNoTimeStyle()
    time = dateFormatter.string(date)
  } else {
    dateFormatter.useMediumDateStyle()
    dateFormatter.useShortTimeStyle()
    time = dateFormatter.string(date)
  }
  return time
}

// add battery
function getBattery() {
  let process = family == 'small' ? 8 : 30
  let batteryLevel = Device.batteryLevel()
  let chargingStatus = Device.isCharging() ? 'charging' : 'no charging'
  let blank = "#".repeat(Math.floor(batteryLevel * process))
  let used = ".".repeat(process - blank.length)
  return '[' + blank + used + ']' + Math.round(batteryLevel * 100) + '%; ' + chargingStatus + ';'
}

// add device info
function getDeviceInfo() {
  let version = Device.systemVersion()
  //   let volume = Math.round(Device.volume() * 100)
  let model = Device.model()
  return '-OS version: ' + version + ' -Model: ' + model
}

// add calender
async function getCalendar() {
  let events = await CalendarEvent.thisWeek()
  let undo = []
  let now = new Date()
  for (let i in events) {
    let event = events[i]
    let endDate = new Date(event.endDate)
    if (endDate.getTime() > now) {
      undo.push(event)
    }
  }
  return undo
}

// get calender num
async function getCalendarNum() {
  let msg = ''
  let undo = await getCalendar()
  let eventLen = undo.length
  if (eventLen > 0) {
    msg = 'You have ' + eventLen + ' ' + (eventLen > 1 ? 'events' : 'event') + ' left for this week:'
  } else {
    msg = 'Great! you have completed all event.'
  }
  return msg
}

// get calender event
async function getCalendarEvent() {
  let undo = await getCalendar()
  let event = undo.pop()
  let allDay = 'All Day'
  if (!event.isAllDay) {
    let dateFormatter = new DateFormatter()
    dateFormatter.locale = 'en'
    dateFormatter.dateFormat = 'EEEE HH:mm:ss'
    allDay = dateFormatter.string(event.startDate) + ' - ' + dateFormatter.string(event.endDate)
  }
  return '- ' + (event.title || 'UNTITLE event') + ' [' + allDay + ']'
}

// to show last login
// 0: get | 1: set
function getOrSetLastLogin(type = 0) {
  let key = 'terminal_home:last_login'
  let tpl = 'Last login: {date} on ttys000'
  let now = getDate(0)
  if (type > 0) {
    Keychain.set(key, now)
  } else {
    if (!Keychain.contains(key)) {
      Keychain.set(key, now)
      tpl.replace('{date}', now)
    }
    lastDate = Keychain.get(key)
    return tpl.replace('{date}', lastDate)
  }
}

// join the order and data
function joinOrderText(order) {
  return widget_conf.prefix.replace('{user}', widget_conf.user) + order
}

// judge item in array
function inArray(arr) {
  for (let i = 0, k = arr.length; i < k; i++) {
    if (family == arr[i]) {
      return true;
    }
  }
  return false;
}

// sleep data
// shoud user Shortscut to create with shortcutshelper.js
function getSleepData() {
  const key = 'shortcuts:sleep'
  if (!Keychain.contains(key)) {
    return 'Sleep data is null.'
  }
  let list = JSON.parse(Keychain.get(key))
  let yesterday = list.pop()
  return 'Sleep duration ' + yesterday.duration + ' hours, target ' + yesterday.target + '%'
}