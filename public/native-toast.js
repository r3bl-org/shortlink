;(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : (global.nativeToast = factory())
})(this, function () {
  "use strict"

  /*!
   * nano-assign v1.0.0
   * (c) 2017-present egoist <0x142857@gmail.com>
   * Released under the MIT License.
   */

  var index = function (obj) {
    var arguments$1 = arguments

    for (var i = 1; i < arguments.length; i++) {
      // eslint-disable-next-line guard-for-in, prefer-rest-params
      for (var p in arguments[i]) {
        obj[p] = arguments$1[i][p]
      }
    }
    return obj
  }

  var nanoAssign_common = index

  var prevToast = null
  var icons = {
    warning:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>',
    success:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    info: '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6.25%"><path d="M16 14 L16 23 M16 8 L16 10" /><circle cx="16" cy="16" r="14" /></svg>',
    error:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12" y2="17"></line></svg>',
  }

  var Toast = function Toast(ref) {
    var this$1 = this
    if (ref === void 0) ref = {}
    var message = ref.message
    if (message === void 0) message = ""
    var position = ref.position
    if (position === void 0) position = "south-east"
    var timeout = ref.timeout
    if (timeout === void 0) timeout = 3000
    var el = ref.el
    if (el === void 0) el = document.body
    var rounded = ref.rounded
    if (rounded === void 0) rounded = false
    var type = ref.type
    if (type === void 0) type = ""
    var debug = ref.debug
    if (debug === void 0) debug = false
    var edge = ref.edge
    if (edge === void 0) edge = false
    var icon = ref.icon
    if (icon === void 0) icon = true
    var closeOnClick = ref.closeOnClick
    if (closeOnClick === void 0) closeOnClick = false
    var elements = ref.elements
    if (elements === void 0) elements = []

    if (prevToast) {
      prevToast.destroy()
    }

    this.message = message
    this.position = position
    this.el = el
    this.timeout = timeout
    this.closeOnClick = closeOnClick
    this.toast = document.createElement("div")
    this.toast.className = "native-toast native-toast-" + this.position

    if (type) {
      this.toast.className += " native-toast-" + type

      if (icon) {
        this.message =
          '<span class="native-toast-icon-' +
          type +
          '">' +
          (icons[type] || "") +
          "</span>" +
          this.message
      }
    }

    var messageElement = document.createElement("div")
    messageElement.className = "native-toast-message"
    messageElement.innerHTML = this.message
    ;[messageElement].concat(elements).forEach(function (el) {
      this$1.toast.appendChild(el)
    })
    var isMobile = document.body.clientWidth < 768

    if (edge || isMobile) {
      this.toast.className += " native-toast-edge"
    } else if (rounded) {
      this.toast.style.borderRadius = "33px"
    }

    this.el.appendChild(this.toast)
    prevToast = this
    this.show()

    if (!debug && timeout) {
      this.hide()
    }

    if (this.closeOnClick) {
      this.toast.addEventListener("click", function () {
        this$1.destroy()
      })
    }
  }

  Toast.prototype.show = function show() {
    var this$1 = this

    setTimeout(function () {
      this$1.toast.classList.add("native-toast-shown")
    }, 300)
  }

  Toast.prototype.hide = function hide() {
    var this$1 = this

    setTimeout(function () {
      this$1.destroy()
    }, this.timeout)
  }

  Toast.prototype.destroy = function destroy() {
    var this$1 = this

    if (!this.toast) {
      return
    }
    this.toast.classList.remove("native-toast-shown")
    setTimeout(function () {
      if (this$1.toast) {
        this$1.el.removeChild(this$1.toast)
        this$1.toast = null
      }
    }, 300)
  }

  function toast(options) {
    return new Toast(options)
  }

  var loop = function () {
    toast[type] = function (options) {
      return toast(
        nanoAssign_common(
          {
            type: type,
          },
          options
        )
      )
    }
  }

  for (var type of ["success", "info", "warning", "error"]) loop()

  return toast
})
