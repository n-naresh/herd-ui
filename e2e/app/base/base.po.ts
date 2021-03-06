/*
* Copyright 2018 herd-ui contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import {browser, by, element, ElementArrayFinder, ElementFinder, promise} from 'protractor';
import {LoginPage} from '../login/login.po';

const conf = require('./../../config/conf.e2e.json');

export class BasePo {
  backTrackLink: ElementFinder = element(by.className('back-track-wrapper')).element(by.tagName('a'));
  private delimiterHypen = ' - ';
  dataEntitiesTitle = 'Data Entities';
  schemaPageTitle = 'Schema';
  loginPage = new LoginPage();
  baseTitle = conf.docTitlePrefix + this.delimiterHypen;
  dataEntityTitle = 'Data Entity' + this.delimiterHypen;

  get currentAlerts(): ElementArrayFinder {
    return element.all(by.tagName('ngb-alert'));
  }

  getSpecificAlert(text: string): ElementFinder {
    return element(by.cssContainingText('ngb-alert', text));
  }

  getTooltipText(el?: ElementFinder): promise.Promise<string> {
    return el ? el.element(by.tagName('ngb-tooltip-window')).getText() : element(by.css('body > ngb-tooltip-window')).getText();
  }

  /**
   * only to be used on non input / textarea inputs
   */
  async clearContentsShim(elm: ElementFinder, replacement?: string): Promise<any> {
    if ((await elm.getText()).trim() !== '') {
      // select the content and then send the delete key to delete the contents
      const script =
        `var range = document.createRange();
   range.selectNodeContents(arguments[0]);
   range.deleteContents();
   arguments[0].innerHTML = arguments[1];`
      return browser.executeScript(script, elm.getWebElement(), replacement || `''`);
    } else {
      return Promise.resolve('no contents in the element');
    }
  }

  /**
   * isDisplayed currently does not work for safariDriver with our saucelabs setup
   */
  async isDisplayedShim(elm: ElementFinder): Promise<boolean> {
    if (process.env.CURRENT_BROWSER === 'safari') {
      const script =
        `return window.getComputedStyle(arguments[0]).display !== 'none' && window.getComputedStyle(arguments[0]).visibility === 'visible'`;
      return browser.executeScript(script, elm.getWebElement()).then((value) => {
        return !!value;
      });
    } else {
      return elm.isDisplayed();
    }
  }

  /**
   * mouseEnter has not been properly ported to newest FireFox yet
   * ie and safari were having issues with using the actions as well
   * same for mouseOver
   */
  async mouseEnterShim(elm: ElementFinder) {
    if (process.env.CURRENT_BROWSER === 'firefox' || process.env.CURRENT_BROWSER === 'ie' || process.env.CURRENT_BROWSER === 'safari') {
      const script = `if(document.createEvent) {
         var evObj = document.createEvent('MouseEvents');
         evObj.initEvent('mouseenter', true, false);
         arguments[0].dispatchEvent(evObj);
       } else if (document.createEventObject) {
         arguments[0].fireEvent('onmouseenter');
       }`;
      return browser.executeScript(script, elm.getWebElement());
    } else {
      return browser.actions()
        .mouseMove(elm.getWebElement())
        .perform();
    }
  }

  /**
 * mouseOver has not been properly ported to newest FireFox yet
 * ie and safari were having issues with using the actions as well
 * same for mouseOver
 */
  async mouseOverShim(elm: ElementFinder) {
    if (process.env.CURRENT_BROWSER === 'firefox' || process.env.CURRENT_BROWSER === 'ie' || process.env.CURRENT_BROWSER === 'safari') {
      const script = `if(document.createEvent) {
         var evObj = document.createEvent('MouseEvents');
         evObj.initEvent('mouseover', true, false);
         arguments[0].dispatchEvent(evObj);
       } else if (document.createEventObject) {
         arguments[0].fireEvent('onmouseover');
       }`;
      return browser.executeScript(script, elm.getWebElement());
    } else {
      return browser.actions()
        .mouseMove(elm.getWebElement())
        .perform();
    }
  }

  async navigateTo(url?: string, user: string = conf.loginUser, pass: string = conf.loginPwd) {
    await browser.get(url || '/');
    if ((await this.loginPage.loginForm.isPresent()) === true && (await this.isDisplayedShim(this.loginPage.loginForm)) === true) {
      return this.loginPage.login(user, pass);
    }
    // immediately return if the login scren isn't there.
    return new Promise((resolve, reject) => {
      resolve();
    })
  }
}


