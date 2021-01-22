const { BrowserWindow, nativeImage } = require("electron")
const cache = {}
exports.themeIcon = function (side, theme) {
  const substituteVars = function (str) {
    return str.replace(/var\(--(.*?)\)/g, (match, p1, offset, string) => {
      return substituteVars(theme[p1])
    })
  }

  const colorString = substituteVars(theme["primary-color"])
  if (cache[colorString]) {
    theme.icon = cache[colorString]
    return Promise.resolve()
  }

  const win = BrowserWindow.getAllWindows()[0]

  return win.webContents
    .executeJavaScript(
      `
      electron_c = document.createElement('canvas')
      electron_c.width = electron_c.height = ${side}
      electron_ctx = electron_c.getContext('2d')
      electron_ctx.fillStyle = '${colorString}'
      electron_ctx.beginPath();
      electron_ctx.arc(${side} / 2, ${side} / 2, ${side} / 2, 0, 2 * Math.PI, false);
      electron_ctx.fill()
      electron_c.toDataURL()
    `,
      true
    )
    .then((dataImage) => {
      cache[colorString] = theme.icon = nativeImage.createEmpty()
      theme.icon.addRepresentation({
        scaleFactor: 1,
        width: side,
        heigth: side,
        dataURL: dataImage,
      })
      win.webContents
        .executeJavaScript(
          `
        electron_c = document.createElement('canvas')
        electron_c.width = electron_c.height = ${side * 2}
        electron_ctx = electron_c.getContext('2d')
        electron_ctx.fillStyle = '${colorString}'
        electron_ctx.beginPath();
        electron_ctx.arc(${side}, ${side}, ${side}, 0, 2 * Math.PI, false);
        electron_ctx.fill()
        electron_c.toDataURL()
      `,
          true
        )
        .then((dataImage) => {
          theme.icon.addRepresentation({
            scaleFactor: 2,
            width: side,
            heigth: side,
            dataURL: dataImage,
          })
        })
    })
}

exports.serviceSelect = function (state) {
  return `localStorage.setItem("panel-dev-service-state-domain-service", "\\"${state}\\"");`
}

exports.themeSelect = function (theme) {
  return `localStorage.setItem("selectedTheme", "\\"${theme}\\"");`
}

exports.currentTheme = function (win, callback) {
  return win.webContents
    .executeJavaScript(`localStorage.getItem("selectedTheme")`, true)
    .then((theme) => callback(theme ? theme.replace(/"/g, "") : theme))
}

exports.stateClick = function (device) {
  return `
    links = document
      .querySelector("home-assistant").shadowRoot
      .querySelector("home-assistant-main").shadowRoot
      .querySelector("ha-panel-developer-tools").shadowRoot
      .querySelector("developer-tools-state").shadowRoot
      .querySelectorAll("a")
    for(let link of links) {
      if(link.innerText == "${device}") {
        link.click()
        break
      }
    }
  `
}

exports.setTheme = function (win, theme) {
  const js = `localStorage.setItem("selectedTheme", "\\"${theme}\\"");`
  win.webContents.executeJavaScript(js, true)
  let targetUrl = new URL(win.webContents.getURL())
  targetUrl.pathname = ""
  targetUrl = targetUrl.toString()
  for (const win of BrowserWindow.getAllWindows()) {
    const current = new URL(win.webContents.getURL()).toString()
    if (current.startsWith(targetUrl)) {
      win.webContents.reload()
    }
  }
}

exports.dragInjector = function (win) {
  // const profile = `
  //   try {
  //     document.querySelector("home-assistant").shadowRoot
  //       .querySelector("home-assistant-main").shadowRoot
  //       .querySelector("ha-panel-profile").shadowRoot
  //       .querySelector("app-header")
  //       .style.webkitAppRegion = "drag"
  //   } catch(error) {
  //     console.log(error)
  //   }
  // `
  // const dashboard = `
  //   try {
  //     document.querySelector("home-assistant").shadowRoot
  //       .querySelector("home-assistant-main").shadowRoot
  //       .querySelector("ha-panel-lovelace").shadowRoot
  //       .querySelector("hui-root").shadowRoot
  //       .querySelector("app-header")
  //       .style.webkitAppRegion = "drag"
  //   } catch(error) {
  //     console.log(error)
  //   }
  // `
  // const jsEdit = `
  //   try {
  //     document.querySelector("home-assistant").shadowRoot
  //       .querySelector("home-assistant-main").shadowRoot
  //       .querySelector("ha-config-script").shadowRoot
  //       .querySelector("ha-script-editor").shadowRoot
  //       .querySelector("hass-tabs-subpage").shadowRoot
  //       .querySelector("div.toolbar").style.webkitAppRegion = "drag"
  //   } catch(error) {
  //     console.log(error)
  //   }
  // `

  // const automationEdit = `
  //   try {
  //     document.querySelector("home-assistant").shadowRoot
  //       .querySelector("home-assistant-main").shadowRoot
  //       .querySelector("ha-config-automation").shadowRoot
  //       .querySelector("ha-automation-editor").shadowRoot
  //       .querySelector("hass-tabs-subpage").shadowRoot
  //       .querySelector("div.toolbar").style.webkitAppRegion = "drag"
  //   } catch(error) {
  //     console.log(error)
  //   }
  // `

  // setTimeout(() => {
  //   win.webContents.executeJavaScript(profile, true)
  //   win.webContents.executeJavaScript(dashboard, true)
  //   win.webContents.executeJavaScript(jsEdit, true)
  //   win.webContents.executeJavaScript(automationEdit, true)
  // }, 300)
  // setTimeout(() => {
  //   win.webContents.executeJavaScript(profile, true)
  //   win.webContents.executeJavaScript(dashboard, true)
  //   win.webContents.executeJavaScript(jsEdit, true)
  //   win.webContents.executeJavaScript(automationEdit, true)
  // }, 800)
}
