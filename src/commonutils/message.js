import Vue from 'vue';
import {Message} from "element-ui";

Vue.use(Message.name, Message);

const showMessage = Symbol('showMessage');

export default class DonMessage {
  success(message, single = true) {
    this[showMessage]('success', message, single)
  }

  warning(message, single = true) {
    this[showMessage]('warning', message, single)
  }

  info(message, single = true) {
    this[showMessage]('info', message, single)
  }

  error(message, single = true) {
    this[showMessage]('error', message, single)
  }

  [showMessage](type, message, single) {
    if (single) {
      if (document.getElementsByClassName('el-message').length > 0) {
        Message.closeAll();
      }
      Message[type]({message});
    } else {
      Message[type]({message})
    }
  }
}
