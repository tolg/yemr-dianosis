var avalon = require("../avalon.getModel"),
holidayDate = require("./avalon.datepicker.lang"),
sourceHTML = "<div class=\"oni-datepicker\"\n     ms-visible=\"toggle\"\n     ms-class=\"oni-datepicker-multiple:numberOfMonths!==1\">\n    <div class=\"oni-datepicker-wrapper\" ms-css-position=\"_position\">\n        <div class=\"oni-datepicker-content\" >\n            <div class=\"oni-datepicker-label\" ms-if=\"numberOfMonths===1\">{{calendarLabel}}</div>\n            <i  class=\"oni-datepicker-prev oni-icon\" \n                ms-if=\"numberOfMonths!==1\" \n                ms-click=\"_prev(prevMonth, $event)\"\n                ms-class=\"oni-datepicker-prev-disabled:!prevMonth\" \n                style=\"left:15px;\">&#xf047;</i>\n            <i  class=\"oni-datepicker-next oni-icon\" \n                ms-if=\"numberOfMonths!==1\" \n                ms-click=\"_next(nextMonth, $event)\"\n                ms-class=\"oni-datepicker-next-disabled:!nextMonth\" \n                style=\"right:15px;\">&#xf03e;</i>\n            <div class=\"oni-datepicker-content-content\" \n                 ms-repeat-calendar=\"data\" \n                 ms-visible=\"_datepickerToggle\">\n                <div class=\"oni-datepicker-header\" ms-if=\"numberOfMonths===1\">\n                    <i class=\"oni-datepicker-prev oni-icon\" \n                       ms-click=\"_prev(prevMonth, $event)\"\n                       ms-class=\"oni-datepicker-prev-disabled:!prevMonth\">&#xf047;</i>\n                    <i class=\"oni-datepicker-next oni-icon\"    \n                       ms-click=\"_next(nextMonth, $event)\"\n                       ms-class=\"oni-datepicker-next-disabled:!nextMonth\">&#xf03e;</i>\n                    <div class=\"oni-datepicker-title\" ms-if=\"changeMonthAndYear && regional.showMonthAfterYear\">\n                        <select ms-each=\"years\" data-each-rendered=\"_afterYearRendered\">\n                            <option ms-attr-value=\"el\">{{el}}</option>\n                        </select>&nbsp;{{regional.yearText}}&nbsp;\n                        <select ms-each=\"months\" data-each-rendered=\"_afterMonthRendered\">\n                            <option ms-attr-value=\"{{el}}\">{{el}}</option>\n                        </select>&nbsp;{{regional.monthText}}\n                    </div>\n                    <div class=\"oni-datepicker-title\" ms-if=\"changeMonthAndYear && !regional.showMonthAfterYear\">\n                        <select ms-each=\"months\" data-each-rendered=\"_afterMonthRendered\">\n                            <option ms-attr-value=\"{{el}}\">{{el}}</option>\n                        </select>&nbsp;{{regional.monthText}}\n                        <select ms-each=\"years\" data-each-rendered=\"_afterYearRendered\">\n                            <option ms-attr-value=\"el\">{{el}}</option>\n                        </select>&nbsp;{{regional.yearText}}&nbsp;\n                    </div>\n                    <div class=\"oni-datepicker-title\"\n                         ms-click=\"_selectMonths\"\n                         ms-if=\"!changeMonthAndYear\">\n                        <span ms-hover=\"oni-state-hover:mobileMonthAndYear\" ms-html=\"_getTitle(calendar.year, calendar.month)\"></span>\n                    </div> \n                </div>\n                <div class=\"oni-datepicker-header\" ms-if=\"numberOfMonths!==1\">\n                    <div class=\"oni-datepicker-title\">\n                        <span ms-hover=\"oni-state-hover:mobileMonthAndYear\" ms-html=\"_getTitle(calendar.year, calendar.month)\"></span>\n                    </div> \n                </div>\n                <table class=\"oni-datepicker-calendar-week\">\n                    <thead>\n                        <tr>\n                            <th ms-repeat=\"weekNames\"\n                                ms-class=\"{{_setWeekClass(el)}}\">{{el}}\n                            </th>\n                        </tr>\n                    </thead>\n                </table>\n                <table class=\"oni-datepicker-calendar-days\">\n                    <tbody>\n                        <tr ms-repeat-days=\"calendar.rows\">\n                            <td class=\"oni-datepicker-default\"\n                                ms-repeat-item=\"days\"\n                                ms-class=\"{{_setDayClass($index, $outer.$index, $outer.$outer.$index, item)}}\"\n                                ms-hover=\"{{_setHoverClass($index, $outer.$index, $outer.$outer.$index, item)}}\"\n                                ms-click=\"_selectDate($index, $outer.$index, $outer.$outer.$index, $event)\"\n                                ms-html=\"_dateCellRender($outer.$index, $index, $outer.$outer.$index, item)\"\n                                ></td>\n                        </tr>\n                    </tbody>\n                </table>\n                <div class=\"oni-datepicker-timer\" ms-if=\"timer\">\n                    <label>\n                        <span>{{regional.timerText}}</span>\n                        <b>{{hour|timer}}</b>&nbsp;:\n                        <b>{{minute|timer}}</b>\n                    </label>\n                    <p>\n                        <span>{{regional.hourText}}</span>\n                        <input ms-widget=\"slider, $, sliderHourOpts\" data-slider-max=\"23\" data-slider-min=\"0\" data-slider-value=\"hour\" data-slider-width=\"140\">\n                    </p>\n                    <p>\n                        <span>{{regional.minuteText}}</span>\n                        <input ms-widget=\"slider, $, sliderMinuteOpts\" data-slider-max=\"59\" data-slider-min=\"0\" data-slider-width=\"140\" data-slider-value=\"minute\">\n                    </p>\n                </div>\n                <div class=\"oni-datepicker-timer oni-helper-clearfix\" ms-if=\"timer\">\n                    <button type=\"button\" class=\"oni-btn oni-btn-small\" style=\"float: left\" ms-click=\"_getNow\">{{regional.nowText}}</button>\n                    <button type=\"button\" class=\"oni-btn oni-btn-primary oni-btn-small\" style=\"float:right\" ms-click=\"_selectTime\">{{regional.confirmText}}</button>\n                </div>\n                <div class=\"oni-datepicker-watermark\" ms-if=\"watermark\">\n                    {{calendar.month+1}}\n                </div>\n            </div>\n            <div class=\"oni-datepicker-content-content oni-datepicker-month-year\" ms-if=\"mobileMonthAndYear\" ms-visible=\"_monthToggle\">\n                <table>\n                    <thead>\n                        <tr class=\"oni-datepicker-title\">\n                            <th class=\"prev\" style=\"visibility: visible;text-align:left\">\n                                <i class=\"oni-datepicker-prev oni-icon\" \n                                   ms-click=\"_prevYear(mobileYear)\"\n                                   ms-class=\"oni-datepicker-prev-disabled:mobileYear===years[0]\">&#xf047;</i>\n                            </th>\n                            <th style=\"text-align:center\" \n                                ms-click=\"_selectYears\" \n                                ms-hover=\"oni-state-hover:mobileMonthAndYear\">{{mobileYear}}</th>\n                            <th class=\"next\" style=\"visibility: visible;text-align:right\">\n                                <i class=\"oni-datepicker-next oni-icon\" \n                                   ms-click=\"_nextYear(mobileYear)\"\n                                   ms-class=\"oni-datepicker-prev-disabled:mobileYear===years[years.length-1]\">&#xf03e;</i>\n                            </th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td colspan=\"3\" style=\"padding:0px\">\n                                <span ms-repeat-m=\"months\" \n                                      ms-class=\"oni-datepicker-selected: (m-1)===elementMonth && mobileYear===elementYear\"\n                                      ms-click=\"_selectDates(m-1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\">{{regional.monthNamesShort[m - 1]}}</span>\n                            </td>\n                        </tr>\n                    </tbody>\n                    <tfoot>\n                        <tr>\n                            <th colspan=\"3\" class=\"today\" style=\"display: none;\">Today</th>\n                        </tr>\n                        <tr>\n                            <th colspan=\"3\" class=\"clear\" style=\"display: none;\">Clear</th>\n                        </tr>\n                    </tfoot>\n                </table>\n            </div>\n\n            <div class=\"oni-datepicker-content-content oni-datepicker-month-year\" ms-if=\"mobileMonthAndYear\" ms-visible=\"_yearToggle\">\n                <table>\n                    <thead>\n                        <tr class=\"oni-datepicker-title\">\n                            <th class=\"prev\" style=\"visibility: visible;text-align:left\">\n                                <i class=\"oni-datepicker-prev oni-icon\" \n                                   ms-click=\"_prevYears\" \n                                   ms-class=\"oni-datepicker-prev-disabled:_years[0]<=years[0]\">&#xf047;</i>\n                            </th>\n                            <th style=\"text-align:center\" \n                                ms-hover=\"oni-state-hover:mobileMonthAndYear\">{{_years[0]}}-{{_years[9]}}\n                            </th>\n                            <th class=\"next\" style=\"visibility: visible;text-align:right\">\n                                <i class=\"oni-datepicker-next oni-icon\" \n                                    ms-click=\"_nextYears\"\n                                    ms-class=\"oni-datepicker-next-disabled:_years[_years.length-1]>=years[years.length-1]\">&#xf03e;</i>\n                            </th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td colspan=\"3\" style=\"padding:0px\">\n                                <span class=\"oni-datepicker-prev-year\"\n                                      ms-class=\"{{_setMobileYearClass(_years[0]-1, elementYear, month, elementMonth)}}\"\n                                      ms-click=\"_selectMonths($event, _years[0]-1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{_years[0]-1}}</span>\n                                <span ms-repeat-y=\"_years\" \n                                      ms-class=\"_setMobileYearClass(y, elementYear, month, elementMonth)\"\n                                      ms-click=\"_selectMonths($event, y)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{y}}</span>\n                                <span class=\"oni-datepicker-next-year\"\n                                      ms-class=\"{{_setMobileYearClass(_years[9]+1, elementYear, month, elementMonth)}}\"\n                                      ms-click=\"_selectMonths($event, _years[9]+1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{_years[9]+1}}</span>\n                            </td>\n                        </tr>\n                    </tbody>\n                    <tfoot>\n                        <tr>\n                            <th colspan=\"3\" class=\"today\" style=\"display: none;\">Today</th></tr>\n\n                            <tr><th colspan=\"3\" class=\"clear\" style=\"display: none;\">Clear</th>\n                        </tr>\n                    </tfoot>\n                </table>\n            </div>\n        </div>\n    </div>\n</div>\n";
require("../dropdown/avalon.dropdown.js");
require("../slider/avalon.slider.js");

module.exports = (
function () {
    var calendarTemplate = sourceHTML, HOLIDAYS, ONE_DAY = 24 * 60 * 60 * 1000, firstYear = 1901, lastYear = 2050;
    var widget = avalon.ui.datepicker = function (element, data, vmodels) {
            var options = data.datepickerOptions, msDuplexName = element.msData['ms-duplex'], duplexVM = msDuplexName && avalon.getModel(msDuplexName, vmodels), parseDate = options.parseDate, formatDate = options.formatDate, minDate = options.minDate, maxDate = options.maxDate, monthYearChangedBoth = false, datepickerData = [], _initValue = '', years = [], minDateVM, maxDateVM, calendar, month, day, year;
            calendarTemplate = options.template = options.getTemplate(calendarTemplate, options);
            avalon.scan(element, vmodels);
            options.disabled = element.disabled || options.disabled;
            formatDate = formatDate.bind(options);
            //兼容IE6、7使得formatDate方法中的this指向options
            parseDate = parseDate.bind(options);
            minDate = minDate !== null && validateDate(minDate);
            maxDate = maxDate !== null && validateDate(maxDate);
            if (options.minDate && !minDate) {
                // minDate是某个VM的属性名
                minDateVM = avalon.getModel(options.minDate, vmodels);
                minDateVM && (minDate = validateDate(minDateVM[1][minDateVM[0]]));
            }
            minDate = options.minDate = minDate && cleanDate(minDate);
            if (options.maxDate && !maxDate) {
                // maxDate 是某个VM的属性名，需要进一步解析
                maxDateVM = avalon.getModel(options.maxDate, vmodels);
                maxDateVM && (maxDate = validateDate(maxDateVM[1][maxDateVM[0]]));
            }
            maxDate = options.maxDate = maxDate && cleanDate(maxDate);
            minDate ? firstYear = minDate.getFullYear() : 0;
            maxDate ? lastYear = maxDate.getFullYear() : 0;
            if (avalon.type(options.years) === 'array') {
                years = options.years;
            } else {
                for (var i = firstYear; i <= lastYear; i++) {
                    years.push(i);
                }
            }
            if (options.mobileMonthAndYear) {
                options.mobileYear = 0;
            }
            options.changeMonthAndYear && (options.mobileMonthAndYear = false);
            initValue();
            var vmodel = avalon.define(data.datepickerId, function (vm) {
                    //初始化增加语言包设置
                    avalon.mix(vm, options, { regional: widget.defaultRegional });
                    vm.$skipArray = [
                        'container',
                        'showDatepickerAlways',
                        'timer',
                        'sliderMinuteOpts',
                        'sliderHourOpts',
                        'template',
                        'widgetElement',
                        'rootElement',
                        'dayNames',
                        'allowBlank',
                        'months',
                        'years',
                        'numberOfMonths',
                        'showOtherMonths',
                        'watermark',
                        'weekNames',
                        'stepMonths',
                        'changeMonthAndYear',
                        'startDay',
                        'mobileMonthAndYear',
                        'formatErrorTip'    //格式错误提示文案
                    ];
                    vm.dateError = vm.dateError || '';
                    vm.weekNames = [];
                    vm.tip = vm.tip || '';
                    vm.widgetElement = element;
                    vm.rootElement = {};
                    vm.data = [];
                    vm.prevMonth = -1;
                    //控制prev class是否禁用
                    vm.nextMonth = -1;
                    //控制next class是否禁用
                    vm.month = month;
                    vm._month = month + 1;
                    vm.year = year;
                    vm.day = day;
                    vm.years = years;
                    vm.months = [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12
                    ];
                    vm._position = 'absolute';
                    vm._datepickerToggle = true;
                    vm._monthToggle = false;
                    vm._yearToggle = false;
                    vm._years = [
                        2010,
                        2011,
                        2012,
                        2013,
                        2014,
                        2015,
                        2016,
                        2017,
                        2018,
                        2019
                    ];
                    vm.elementYear = year;
                    vm.elementMonth = month;
                    vm._setWeekClass = function (dayName) {
                        var dayNames = vmodel.regional.day;
                        if (dayNames.indexOf(dayName) % 7 == 0 || dayNames.indexOf(dayName) % 7 == 6) {
                            return 'oni-datepicker-week-end';
                        } else {
                            return '';
                        }
                    };
                    vm._setDayClass = function (index, outerIndex, rowIndex, day) {
                        var className = '', dayItem = {};
                        if (day === '') {
                            return '';
                        }
                        dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                        if (dayItem.weekend) {
                            className += ' oni-datepicker-week-end';
                        }
                        if (!dayItem.month) {
                            className += ' oni-datepicker-day-none';
                        }
                        if (dayItem.selected) {
                            className += ' oni-datepicker-selected';
                        }
                        if (dayItem.dateDisabled) {
                            className += ' oni-state-disabled';
                        }
                        return className.trim();
                    };
                    vm._setHoverClass = function (index, outerIndex, rowIndex, day) {
                        var className = '', dayItem = {};
                        if (day === '') {
                            return '';
                        }
                        dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                        className = 'oni-datepicker-day-hover';
                        return className;
                    };
                    vm._setMobileYearClass = function (yearItem, elementYear, monthItem, elementMonth) {
                        var className = '';
                        if (yearItem === elementYear && monthItem === elementMonth) {
                            className += ' oni-datepicker-selected';
                        }
                        if (vmodel.mobileYearDisabled(yearItem)) {
                            className += ' oni-state-disabled';
                        }
                        return className;
                    };
                    vm.sliderMinuteOpts = {
                        onInit: function (sliderMinute, options, vmodels) {
                            sliderMinute.$watch('value', function (val) {
                                vmodel.minute = val;
                            });
                            vmodel.$watch('minute', function (val) {
                                sliderMinute.value = val;
                            });
                        }
                    };
                    vm.sliderHourOpts = {
                        onInit: function (sliderHour, options, vmodels) {
                            sliderHour.$watch('value', function (val) {
                                vmodel.hour = val;
                            });
                            vmodel.$watch('hour', function (val) {
                                sliderHour.value = val;
                            });
                        }
                    };
                    vm.$yearVmId = vm.$id + 'year';
                    vm.$monthVmId = vm.$id + 'month';
                    vm.$yearOpts = {
                        width: 60,
                        listWidth: 60,
                        height: 160,
                        position: false,
                        listClass: 'oni-datepicker-dropdown',
                        onSelect: function (e) {
                            e.stopPropagation();
                        }
                    };
                    vm.$monthOpts = {
                        width: 45,
                        height: 160,
                        listWidth: 45,
                        position: false,
                        listClass: 'oni-datepicker-dropdown',
                        onSelect: function (e) {
                            e.stopPropagation();
                        }
                    };
                    vm._selectDates = function (month) {
                        if (vmodel.mobileMonthAndYear) {
                            vmodel._monthToggle = false;
                            vmodel._yearToggle = false;
                            vmodel._datepickerToggle = true;
                            monthYearChangedBoth = true;
                            vmodel.year = vmodel.mobileYear;
                            vmodel.month = month;
                        }
                    };
                    vm._selectMonths = function (event, year) {
                        if (vmodel.mobileMonthAndYear) {
                            if (year) {
                                if (!vmodel.mobileYearDisabled(year)) {
                                    vmodel.mobileYear = year;
                                } else {
                                    return;
                                }
                            } else {
                                vmodel.mobileYear = vmodel.year;
                            }
                            vmodel._monthToggle = true;
                            vmodel._yearToggle = false;
                            vmodel._datepickerToggle = false;
                        }
                    };
                    vm._selectYears = function () {
                        if (vmodel.mobileMonthAndYear) {
                            vmodel._monthToggle = false;
                            vmodel._yearToggle = true;
                            vmodel._datepickerToggle = false;
                        }
                    };
                    vm.getInitTime = function (timeDate) {
                        var date = formatDate(timeDate), time = timeDate.toTimeString(), now = time.substr(0, time.lastIndexOf(':'));
                        vmodel.hour = timeDate.getHours();
                        vmodel.minute = timeDate.getMinutes();
                        return date + ' ' + now;
                    };
                    vm._dateCellRender = function (outerIndex, index, rowIndex, date) {
                        if (vmodel.dateCellRender) {
                            var dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                            if (date === '') {
                                return date;
                            }
                            return vmodel.dateCellRender(date, vmodel, dayItem);
                        }
                        return date;
                    };
                    vm._selectTime = function (event) {
                        var timeFilter = avalon.filters.timer, hour = timeFilter(vmodel.hour), minute = timeFilter(vmodel.minute), time = hour + ':' + minute, _date = formatDate(parseDate(element.value));
                        event.stopPropagation();
                        element.value = _date + ' ' + time;
                        if (!vmodel.showDatepickerAlways) {
                            vmodel.toggle = false;
                        }
                        if (options.onSelectTime && avalon.type(options.onSelectTime) === 'function') {
                            options.onSelectTime.call(vmodel, vmodel);
                        }
                    };
                    vm._selectYearMonth = function (event) {
                        event.stopPropagation();
                    };
                    // 点击prev按钮切换到当前月的上个月，如当前月存在minDate则prev按钮点击无效
                    vm._prev = function (prevFlag, event) {
                        if (!prevFlag) {
                            return false;
                        }
                        toggleMonth('prev');
                        event.stopPropagation();
                    };
                    // 点击next按钮切换到当前月的下一个月，如果当前月存在maxDate则next按钮点击无效
                    vm._next = function (nextFlag, event) {
                        if (!nextFlag) {
                            return false;
                        }
                        toggleMonth('next');
                        event.stopPropagation();
                    };
                    vm._prevYear = function (year) {
                        if (year === vmodel.years[0]) {
                            return;
                        }
                        vmodel.mobileYear = vmodel.mobileYear - 1;
                    };
                    vm._nextYear = function (year) {
                        if (year === vmodel.years[vmodel.years.length - 1]) {
                            return;
                        }
                        vmodel.mobileYear = vmodel.mobileYear + 1;
                    };
                    vm._prevYears = function () {
                        if (vmodel._years[0] <= vmodel.years[0]) {
                            return;
                        }
                        updateMobileYears(vmodel._years[0] - 1);
                    };
                    vm._nextYears = function () {
                        var _years = vmodel._years, years = vmodel.years;
                        if (_years[_years.length - 1] >= years[years.length - 1]) {
                            return;
                        }
                        updateMobileYears(_years[9] + 1);
                    };
                    vm.mobileYearDisabled = function (year) {
                        var years = vmodel.years;
                        if (year < years[0] || year > years[years.length - 1]) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    vm.getRawValue = function () {
                        return element.value;
                    };
                    vm.getDate = function () {
                        var value = vmodel.getRawValue();
                        return parseDate(value);
                    };
                    // 年份选择器渲染ok之后为其绑定dropdown组件并扫描渲染出dropdown
                    vm._afterYearRendered = function () {
                        this.setAttribute('ms-widget', [
                            'dropdown',
                            vm.$yearVmId,
                            '$yearOpts'
                        ].join(','));
                        this.setAttribute('ms-duplex', 'year');
                        avalon.scan(this, vmodel);
                    };
                    // 月份选择器渲染ok之为其绑定dropdown组件并扫描渲染出dropdown
                    vm._afterMonthRendered = function () {
                        this.setAttribute('ms-widget', [
                            'dropdown',
                            vm.$monthVmId,
                            '$monthOpts'
                        ].join(','));
                        this.setAttribute('ms-duplex', '_month');
                        avalon.scan(this, vmodel);
                    };
                    // 选择日期
                    vm._selectDate = function (index, outerIndex, rowIndex, event) {
                        var timerFilter = avalon.filters.timer, _oldMonth = vmodel.month, _oldYear = vmodel.year, dayItem = datepickerData[rowIndex]['rows'][outerIndex][index], year = dayItem.year, month = dayItem.month, day = +dayItem.day, dateDisabled = dayItem.dateDisabled;
                        event.stopPropagation();
                        event.preventDefault();
                        if (month !== false && !dateDisabled && !vmodel.showDatepickerAlways) {
                            var _date = new Date(year, month, day), date = formatDate(_date), calendarWrapper = options.type === 'range' ? element['data-calenderwrapper'] : null;
                            vmodel.tip = getDateTip(cleanDate(_date)).text;
                            vmodel.dateError = '#cccccc';
                            if (!calendarWrapper && !vmodel.timer) {
                                element.value = date;
                                vmodel.toggle = false;
                            } else {
                                // range datepicker时需要切换选中日期项的类名
                                if (vmodel.timer) {
                                    date = date + ' ' + timerFilter(vmodel.hour) + ':' + timerFilter(vmodel.minute);
                                }
                                element.value = date;
                            }
                            if (month === _oldMonth && year === _oldYear && vmodel.day == day) {
                                vmodel.$fire('day', day);
                            } else {
                                vmodel.day = day;
                            }
                            if (month !== _oldMonth && year !== _oldYear) {
                                monthYearChangedBoth = true;
                                vmodel.year = year;
                                vmodel.month = month;
                            } else if (month !== _oldMonth) {
                                vmodel.month = month;
                            } else if (year !== _oldYear) {
                                vmodel.year = year;
                            }
                        }
                        if (!vmodel.showDatepickerAlways && !duplexVM) {
                            if (typeof vmodel.onSelect === 'string') {
                                avalon.log('onSelect \u56DE\u8C03\u5FC5\u987B\u662F\u4E2Afunction\uFF01');
                                return;
                            }
                            vmodel.onSelect.call(null, date, vmodel, avalon(element).data());
                        }
                    };
                    //设置语言包
                    vm.setRegional = function (regional) {
                        vmodel.regional = regional;
                    };
                    vm.$init = function (continueScan) {
                        var elementPar = element.parentNode;
                        calendar = avalon.parseHTML(calendarTemplate).firstChild;
                        elementPar.insertBefore(calendar, element);
                        elementPar.insertBefore(element, calendar);
                        avalon(element).attr('ms-css-width', 'width');
                        vmodel.weekNames = calendarHeader();
                        if (element.tagName === 'INPUT' && vmodel.type !== 'range') {
                            var div = document.createElement('div');
                            div.className = 'oni-datepicker-input-wrapper';
                            div.setAttribute('ms-class', 'oni-datepicker-active:toggle');
                            div.setAttribute('ms-css-border-color', 'dateError');
                            div.setAttribute('ms-hover', 'oni-state-hover');
                            elementPar.insertBefore(div, element);
                            div.appendChild(element);
                            if (vmodel.showTip) {
                                var tip = avalon.parseHTML('<div class=\'oni-datepicker-tip\'>{{tip}}<i class=\'oni-icon oni-icon-calendar-o\'>&#xf088;</i></div>');
                                div.appendChild(tip);
                            } else {
                                element.style.paddingRight = '0px';
                            }
                            div.appendChild(calendar);
                        }
                        if (vmodel.timer) {
                            vmodel.width = 100;
                            var time = validateTime(_initValue);
                            if (_initValue && time) {
                                _initValue = vmodel.getInitTime(time);
                            }
                        }
                        element.value = _initValue;
                        element.disabled = vmodel.disabled;
                        if (vmodel.showDatepickerAlways) {
                            element.style.display = 'none';
                            vmodel.toggle = true;
                            vmodel._position = 'relative';
                            div.style.borderWidth = 0;
                        } else {
                            bindEvents(calendar, div);
                        }
                        if (options.type === 'range') {
                            div = element['data-calenderwrapper'];
                            vmodel._position = 'static';
                        } else {
                            avalon.scan(div, [vmodel]);
                        }
                        vm.rootElement = div;
                        avalon.scan(calendar, [vmodel].concat(vmodels));
                        setTimeout(function () {
                            calendarDays(vmodel.month, vmodel.year);
                        }, 10);
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm._getTitle = function (year, month) {
                        return vmodel.regional.titleFormat.call(vmodel.regional, year, month);
                    };
                    vm.$remove = function () {
                        var elementPar = element.parentNode, eleParPar = elementPar.parentNode, calendarPar = calendar.parentNode;
                        calendar.innerHTML = calendar.textContent = '';
                        calendarPar.removeChild(calendar);
                        eleParPar.removeChild(elementPar);
                    };
                });
            getDateTip = getDateTip.bind(vmodel);
            vmodel.$watch('toggle', function (val) {
                var dateFormat = element.value, date = parseDate(dateFormat), elementYear = date && date.getFullYear(), elementMonth = date && date.getMonth();
                if (val) {
                    vmodel.elementMonth = elementMonth || -1;
                    vmodel.elementYear = elementYear || -1;
                } else {
                    if (vmodel.year != elementYear && vmodel.month != elementMonth) {
                        if (!date) {
                            monthYearChangedBoth = true;
                            var today = new Date(), yearToday = today.getFullYear(), monthToday = today.getMonth();
                            if (vmodel.year == yearToday && vmodel.month == monthToday) {
                                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
                            } else if (vmodel.year == yearToday) {
                                vmodel.month = monthToday;
                            } else if (vmodel.month == monthToday) {
                                vmodel.year = yearToday;
                            } else {
                                monthYearChangedBoth = true;
                                vmodel.year = yearToday;
                                vmodel.month = monthToday;
                            }
                        } else {
                            monthYearChangedBoth = true;
                            vmodel.year = elementYear;
                            vmodel.month = elementMonth;
                        }
                    } else if (vmodel.year != elementYear) {
                        vmodel.year = elementYear;
                    } else if (vmodel.month != elementMonth) {
                        vmodel.month = elementMonth;
                    }
                    // 防止Month, Year下拉框的浮层不被关闭。
                    avalon.vmodels[vmodel.$yearVmId] && (avalon.vmodels[vmodel.$yearVmId].toggle = false);
                    avalon.vmodels[vmodel.$monthVmId] && (avalon.vmodels[vmodel.$monthVmId].toggle = false);
                    vmodel.onClose(new Date(vmodel.year, vmodel.month, vmodel.day), vmodel);
                }
            });
            vmodel.$watch('year', function (year) {
                if (vmodel.mobileMonthAndYear) {
                    updateMobileYears(year);
                }
                if (!monthYearChangedBoth) {
                    setCalendarDays(vmodel.month, year, vmodel.day);
                } else {
                    monthYearChangedBoth = false;
                }
                vmodel.onChangeMonthYear(year, vmodel.month + 1, vmodel);
            });
            if (vmodel.changeMonthAndYear) {
                vmodel.$watch('_month', function (month) {
                    vmodel.month = month - 1;
                });
            }
            vmodel.$watch('month', function (month) {
                vmodel._month = month + 1;
                setCalendarDays(month, vmodel.year, vmodel.day);
                vmodel.onChangeMonthYear(vmodel.year, month, vmodel);
            });
            vmodel.$watch('day', function (newDay, oldDay) {
                var data = datepickerData, month = vmodel.month, year = vmodel.year, exitLoop = false, dateYear, dateMonth, dateDay;
                for (var i = 0, len = data.length; i < len; i++) {
                    var dataItem = data[i];
                    if (dataItem.year == year && dataItem.month == month) {
                        var dataRows = dataItem.rows;
                        for (var j = 0, jLen = dataRows.length; j < jLen; j++) {
                            var dataRow = dataRows[j];
                            for (var k = 0, kLen = dataRow.length; k < kLen; k++) {
                                var dayItem = dataRow[k], date = dayItem.day;
                                if (date == newDay && dayItem.month == month && dayItem.year == year) {
                                    dayItem.selected = true;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                } else if (dayItem.selected) {
                                    dayItem.selected = false;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                }
                            }
                        }
                    } else {
                        for (var j = 0, jLen = dataRows.length; j < jLen; j++) {
                            var dataRow = dataRows[j];
                            for (var k = 0, kLen = dataRow.length; k < kLen; k++) {
                                var dateItem = dataRow[k];
                                if (dayItem.selected) {
                                    dayItem.selected = false;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                    exitLoop = true;
                                    break;
                                }
                            }
                            if (exitLoop) {
                                break;
                            }
                        }
                    }
                    if (exitLoop) {
                        break;
                    }
                }
            });
            // 这里的处理使得设置外部disabled或者组件VM的disabled同步
            vmodel.$watch('disabled', function (val) {
                element.disabled = val;
            });
            vmodel.$watch('minDate', function (val) {
                var minDate = validateDate(val);
                if (minDate) {
                    vmodel.minDate = cleanDate(minDate);
                } else {
                    vmodel.minDate = '';
                }
                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
            });
            vmodel.$watch('maxDate', function (val) {
                var maxDate = validateDate(val);
                if (maxDate) {
                    vmodel.maxDate = cleanDate(maxDate);
                } else {
                    vmodel.maxDate = '';
                }
                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
            });
            duplexVM && duplexVM[1].$watch(duplexVM[0], function (val) {
                var currentYear, currentMonth, date;
                if (date = parseDate(val)) {
                    currentYear = date.getFullYear();
                    currentMonth = date.getMonth();
                    vmodel.day = date.getDate();
                    if (currentMonth !== vmodel.month && currentYear !== vmodel.year) {
                        monthYearChangedBoth = true;
                        vmodel.year = currentYear;
                        vmodel.month = currentMonth;
                    } else if (currentYear !== vmodel.year) {
                        vmodel.year = currentYear;
                    } else if (currentMonth !== vmodel.month) {
                        vmodel.month = currentMonth;
                    }
                    vmodel.dateError = '#cccccc';
                    vmodel.tip = getDateTip(cleanDate(date)).text;
                    if (typeof vmodel.onSelect === 'string') {
                        avalon.log('onSelect \u56DE\u8C03\u5FC5\u987B\u662F\u4E2Afunction\uFF01');
                        return;
                    }
                    vmodel.onSelect.call(null, date, vmodel, avalon(element).data());
                } else {
                    if (!vmodel.allowBlank) {
                        vmodel.tip = vmodel.formatErrorTip;
                        vmodel.dateError = '#ff8888';
                    } else {
                        vmodel.tip = '';
                    }
                }
            });
            minDateVM && minDateVM[1].$watch(minDateVM[0], function (val) {
                vmodel.minDate = val;
            });
            maxDateVM && maxDateVM[1].$watch(maxDateVM[0], function (val) {
                vmodel.maxDate = val;
            });
            function initValue() {
                var value = element.value, _date = parseDate(value), today = cleanDate(new Date()), _initDate = _date, dateDisabled = false;
                if (value && !_date) {
                    options.tip = options.formatErrorTip;
                    options.dateError = '#ff8888';
                    _initDate = today;
                }
                if (options.allowBlank) {
                    if (!value) {
                        options.tip = '';
                        _initDate = today;
                    } else if (_date) {
                        dateDisabled = isDateDisabled(_date, options);
                    }
                } else {
                    if (!value) {
                        value = formatDate(today);
                        options.tip = getDateTip(today).text;
                        _initDate = today;
                        dateDisabled = isDateDisabled(today, options);
                    } else if (_date) {
                        dateDisabled = isDateDisabled(_date, options);
                    }
                }
                if (dateDisabled) {
                    _initDate = options.minDate || options.maxDate;
                    value = formatDate(_initDate);
                }
                year = _initDate.getFullYear();
                month = _initDate.getMonth();
                day = _initDate.getDate();
                _initValue = value;
            }
            function updateMobileYears(year) {
                //todo--- 看能不能把数组的赋值，变成set的方式
                var years = vmodel._years, _year3 = (year + '').substr(0, 3), newYears = [];
                if (!~years.indexOf(year)) {
                    for (var i = 0; i <= 9; i++) {
                        newYears.push(Number(_year3 + i));
                    }
                    vmodel._years = newYears;
                }
            }
            // 根据minDate和maxDate的设置判断给定的日期是否不可选
            function isDateDisabled(date, vmodel) {
                var time = date.getTime(), minDate = vmodel.minDate, maxDate = vmodel.maxDate;
                if (minDate && time < minDate.getTime()) {
                    return true;
                } else if (maxDate && time > maxDate.getTime()) {
                    return true;
                }
                return false;
            }
            //todo-- 看看事件绑定这块可否优化
            // 初始化时绑定各种回调
            function bindEvents(calendar, tipContainer) {
                // focus Input元素时显示日历组件
                avalon.bind(element, 'focus', function (e) {
                    vmodel.toggle = true;
                });
                // 切换日期年月或者点击input输入域时不隐藏组件，选择日期或者点击文档的其他地方则隐藏日历组件
                avalon.bind(document, 'click', function (e) {
                    var target = e.target;
                    if (options.type === 'range') {
                        return;
                    }
                    if (!calendar.contains(target) && !tipContainer.contains(target) && vmodel.toggle && !vmodel.timer) {
                        vmodel.toggle = false;
                        return;
                    } else if (!vmodel.toggle && !vmodel.disabled && tipContainer.contains(target)) {
                        vmodel.toggle = true;
                        return;
                    }
                });
                // 处理用户的输入
                avalon.bind(element, 'keydown', function (e) {
                    var keyCode = e.keyCode, operate, eChar;
                    eChar = e.key;
                    if (eChar) {
                        switch (eChar) {
                        case '-':
                            operate = '-';
                            break;
                        case '/':
                            operate = '/';
                            break;
                        }
                    } else {
                        switch (keyCode) {
                        case 189:
                            operate = '-';
                            break;
                        case 191:
                            operate = '/';
                            break;
                        }
                    }
                    if (!vmodel.toggle) {
                        vmodel.toggle = true;
                    }
                    // 37:向左箭头； 39:向右箭头；8:backspace；46:Delete
                    if ((keyCode < 48 || keyCode > 57 && keyCode < 96 || keyCode > 105) && keyCode !== 13 && keyCode !== 8 && options.separator !== operate && keyCode !== 27 && keyCode !== 9 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
                        e.preventDefault();
                        return false;
                    }
                });
                avalon.bind(element, 'keyup', function (e) {
                    var value = element.value, year = vmodel.year, month = vmodel.month, keyCode = e.keyCode, dateMonth, dateYear, date;
                    if (keyCode === 37 || keyCode === 39) {
                        return false;
                    }
                    // 当按下Enter、Tab、Esc时关闭日历
                    if (keyCode === 13 || keyCode == 27 || keyCode == 9) {
                        vmodel.toggle = false;
                        return false;
                    }
                    if (date = parseDate(value)) {
                        dateMonth = date.getMonth();
                        dateYear = date.getFullYear();
                        vmodel.dateError = '#cccccc';
                        vmodel.tip = getDateTip(cleanDate(date)).text;
                        vmodel.day = date.getDate();
                        if (month != dateMonth && year != dateYear) {
                            monthYearChangedBoth = true;
                            vmodel.year = dateYear;
                            vmodel.month = dateMonth;
                        } else if (month != dateMonth) {
                            vmodel.month = dateMonth;
                        } else {
                            vmodel.year = dateYear;
                        }
                    } else {
                        if (vmodel.allowBlank && value == '') {
                            vmodel.tip = '';
                            vmodel.dateError = '#cccccc';
                            return;
                        }
                        vmodel.tip = vmodel.formatErrorTip;
                        vmodel.dateError = '#ff8888';
                    }
                });
            }
            // 通过prev、next按钮切换月份
            function toggleMonth(operate) {
                var month = vmodel.month, year = vmodel.year, stepMonths = vmodel.stepMonths, numberOfMonths = vmodel.numberOfMonths, firstDayOfNextMonth, firstDayMonth = 0, firstDayYear = 0;
                if (operate === 'next') {
                    month = month + stepMonths + numberOfMonths - 1;
                } else {
                    month = month - stepMonths - numberOfMonths + 1;
                }
                firstDayOfNextMonth = new Date(year, month, 1);
                firstDayMonth = firstDayOfNextMonth.getMonth();
                firstDayYear = firstDayOfNextMonth.getFullYear();
                if (firstDayYear != vmodel.year) {
                    monthYearChangedBoth = true;
                    vmodel.year = firstDayYear;
                    vmodel.month = firstDayMonth;
                } else {
                    vmodel.month = firstDayMonth;
                }
            }
            // 日历头部的显示名
            function calendarHeader() {
                var weekNames = [], startDay = options.startDay;
                for (var j = 0, w = vmodel.regional.dayNames; j < 7; j++) {
                    var n = (j + startDay) % 7;
                    weekNames.push(w[n]);
                }
                return weekNames;
            }
            function calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day) {
                var selected = false, tip = getDateTip(cellDate), _day = tip && tip.cellText || day, weekDay = cellDate.getDay(), weekend = weekDay % 7 == 0 || weekDay % 7 == 6, dateDisabled = isDateDisabled(cellDate, vmodel);
                if (valueDate && valueDate.getDate() === +day && dateMonth === valueDate.getMonth() && dateYear === valueDate.getFullYear()) {
                    selected = true;
                }
                days.push({
                    day: day + '',
                    _day: _day + '',
                    month: dateMonth,
                    year: dateYear,
                    weekend: weekend,
                    selected: selected,
                    dateDisabled: dateDisabled
                });
                _days.push(_day + '');
            }
            // 根据month、year得到要显示的日期数据
            function calendarDays(month, year) {
                var startDay = vmodel.startDay, firstDayOfMonth = new Date(year, month, 1), cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7), showOtherMonths = vmodel.showOtherMonths, valueDate = parseDate(element.value), minDate = vmodel.minDate, maxDate = vmodel.maxDate, prev = minDate ? (year - minDate.getFullYear()) * 12 + month - minDate.getMonth() > 0 : true, next = maxDate ? (maxDate.getFullYear() - year) * 12 + maxDate.getMonth() - month > 0 : true, rows = [], _rows = [], data = [], _data = [], days = [], _days = [], dateYear, dateMonth, day;
                vmodel.prevMonth = prev;
                vmodel.nextMonth = next;
                for (var i = 0, len = vmodel.numberOfMonths; i < len; i++) {
                    for (var m = 0; m < 6; m++) {
                        days = [];
                        _days = [];
                        for (var n = 0; n < 7; n++) {
                            dateMonth = cellDate.getMonth();
                            dateYear = cellDate.getFullYear();
                            day = cellDate.getDate();
                            if (dateYear === year && dateMonth === month) {
                                calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day);
                            } else {
                                if (showOtherMonths && m === 0 && (dateYear < year || dateMonth < month)) {
                                    calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day);
                                } else {
                                    _days.push('');
                                    days.push({
                                        day: '',
                                        month: false,
                                        weekend: false,
                                        selected: false,
                                        dateDisabled: true
                                    });
                                }
                            }
                            cellDate = new Date(cellDate.setDate(day + 1));
                        }
                        rows.push(days);
                        _rows.push(_days);
                    }
                    data.push({
                        year: year,
                        month: month,
                        rows: rows
                    });
                    _data.push({
                        year: year,
                        month: month,
                        rows: _rows
                    });
                    month += 1;
                    firstDayOfMonth = new Date(year, month, 1);
                    year = firstDayOfMonth.getFullYear();
                    month = firstDayOfMonth.getMonth();
                    cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7);
                    rows = [];
                    _rows = [];
                }
                datepickerData = data;
                vmodel.data = _data;
            }
            function setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n) {
                var selected = false, month = valueDate && valueDate.getMonth(), year = valueDate && valueDate.getFullYear(), tip = getDateTip(cellDate), _day = tip && tip.cellText || dateDay, weekDay = cellDate.getDay(), weekend = weekDay % 7 == 0 || weekDay % 7 == 6, dateDisabled = isDateDisabled(cellDate, vmodel), dayItem = datepickerData[i]['rows'][m][n], rowItem = vmodel.data[i]['rows'][m];
                _day = _day + '';
                if (dateDay === +day && dateMonth === month && dateYear === year) {
                    selected = true;
                }
                if (dayItem._day == _day && (dayItem.selected != selected || dayItem.dateDisabled != dateDisabled)) {
                    avalon.mix(dayItem, {
                        month: dateMonth,
                        year: dateYear,
                        selected: selected,
                        dateDisabled: dateDisabled
                    });
                    rowItem.set(n, '').set(n, _day);
                } else if (dayItem._day == _day) {
                    avalon.mix(dayItem, {
                        month: dateMonth,
                        year: dateYear
                    });
                } else {
                    avalon.mix(dayItem, {
                        day: dateDay + '',
                        _day: _day,
                        month: dateMonth,
                        year: dateYear,
                        weekend: weekend,
                        selected: selected,
                        dateDisabled: dateDisabled
                    });
                    rowItem.set(n, _day);
                }
            }
            function setCalendarDays(month, year, day) {
                var startDay = vmodel.startDay, firstDayOfMonth = new Date(year, month, 1), cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7), showOtherMonths = vmodel.showOtherMonths, valueDate = parseDate(element.value), minDate = vmodel.minDate, maxDate = vmodel.maxDate, prev = minDate ? (year - minDate.getFullYear()) * 12 + month - minDate.getMonth() > 0 : true, next = maxDate ? (maxDate.getFullYear() - year) * 12 + maxDate.getMonth() - month > 0 : true, dateYear, dateMonth, dateDay;
                vmodel.prevMonth = prev;
                vmodel.nextMonth = next;
                for (var i = 0, len = vmodel.numberOfMonths; i < len; i++) {
                    vmodel.data[i].year = year;
                    vmodel.data[i].month = month;
                    datepickerData[i].year = year;
                    datepickerData[i].month = month;
                    for (var m = 0; m < 6; m++) {
                        for (var n = 0; n < 7; n++) {
                            dateMonth = cellDate.getMonth();
                            dateYear = cellDate.getFullYear();
                            dateDay = cellDate.getDate();
                            if (dateYear === year && dateMonth === month) {
                                setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n);
                            } else {
                                if (showOtherMonths && m === 0 && (dateYear < year || dateMonth < month)) {
                                    setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n);
                                } else {
                                    vmodel.data[i]['rows'][m].set(n, '');
                                    avalon.mix(datepickerData[i]['rows'][m][n], {
                                        day: '',
                                        _day: '',
                                        month: false,
                                        weekend: false,
                                        selected: false,
                                        dateDisabled: true
                                    });
                                }
                            }
                            cellDate = new Date(cellDate.setDate(dateDay + 1));
                        }
                    }
                    month += 1;
                    firstDayOfMonth = new Date(year, month, 1);
                    year = firstDayOfMonth.getFullYear();
                    month = firstDayOfMonth.getMonth();
                    cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7);
                }
            }
            // 检验date
            function validateDate(date) {
                if (typeof date == 'string') {
                    return parseDate(date);
                } else {
                    return date;
                }
            }
            // 检验time
            function validateTime(date) {
                if (typeof date == 'string') {
                    var theDate = parseDate(date), timeReg = /\s[0-2]?[0-9]:[0-5]?[0-9]/, _time = date.match(timeReg);
                    if (theDate && _time && _time.length) {
                        var time = _time[0].split(':'), hour = +time[0], minute = +time[1];
                        theDate = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate(), hour, minute);
                    }
                    return theDate;
                } else {
                    return date;
                }
            }
            return vmodel;
        };
    widget.regional = [];
    widget.regional['zh-CN'] = {
        holidayDate: initHoliday(holidayDate),
        dayNames: [
            '\u65E5',
            '\u4E00',
            '\u4E8C',
            '\u4E09',
            '\u56DB',
            '\u4E94',
            '\u516D'
        ],
        //该变量被注册到了vm中，同时在方法中使用
        weekDayNames: [
            '\u5468\u65E5',
            '\u5468\u4E00',
            '\u5468\u4E8C',
            '\u5468\u4E09',
            '\u5468\u56DB',
            '\u5468\u4E94',
            '\u5468\u516D'
        ],
        monthNames: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        monthNamesShort: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        closeText: 'Done',
        prevText: '\u524D',
        prevDayText: '\u6628\u5929',
        nextText: '\u540E',
        nextDayText: '\u660E\u5929',
        dayAfterTomorrow: '\u540E\u5929',
        currentDayText: '\u4ECA\u5929',
        currentDayFullText: '\u4ECA\u5929',
        showMonthAfterYear: true,
        titleFormat: function (year, month) {
            return year + '\u5E74' + ' ' + this.monthNames[month];
        },
        dayText: '\u5929',
        weekText: '\u5468',
        yearText: '\u5E74',
        monthText: '\u6708',
        timerText: '\u65F6\u95F4',
        hourText: '\u65F6',
        minuteText: '\u5206',
        nowText: '\u73B0\u5728',
        confirmText: '\u786E\u5B9A'
    };
    //设置默认语言包
    widget.defaultRegional = widget.regional['zh-CN'];
    widget.version = 1;
    widget.defaults = {
        startDay: 1,
        //@config 设置每一周的第一天是哪天，0代表Sunday，1代表Monday，依次类推, 默认从周一开始
        minute: 0,
        //@config 设置time的默认minute
        hour: 0,
        //@config 设置time的hour
        width: 90,
        //@config 设置日历框宽度
        showTip: true,
        //@config 是否显示节日提示
        disabled: false,
        //@config 是否禁用日历组件
        changeMonthAndYear: false,
        //@config 是否可以通过下拉框选择月份或者年份
        mobileMonthAndYear: false,
        //@config PC端可以通过设置changeMonthAndYear为true使用dropdown的形式选择年份或者月份，但是移动端只能通过设置mobileMonthAndYear为true来选择月份、年份
        showOtherMonths: false,
        //@config 是否显示非当前月的日期
        numberOfMonths: 1,
        //@config 一次显示的日历月份数, 默认一次显示一个
        allowBlank: false,
        //@config 是否允许日历框为空
        minDate: null,
        //@config 最小的可选日期，可以配置为Date对象，也可以是yyyy-mm-dd格式的字符串，或者当分隔符是“/”时，可以是yyyy/mm/dd格式的字符串
        maxDate: null,
        //@config 最大的可选日期，可以配置为Date对象，也可以是yyyy-mm-dd格式的字符串，或者当分隔符是“/”时，可以是yyyy/mm/dd格式的字符串
        stepMonths: 1,
        //@config 当点击next、prev链接时应该跳过几个月份, 默认一个月份
        toggle: false,
        //@config 设置日历的显示或者隐藏，false隐藏，true显示
        separator: '-',
        //@config 日期格式的分隔符,默认“-”，可以配置为"/"，而且默认日期格式必须是yyyy-mm-dd
        calendarLabel: '\u9009\u62E9\u65E5\u671F',
        //@config 日历组件的说明label
        /**
         * @config {Function} 当month或者year更新时调用的回调
         * @param year {Number} 当前日期的year
         * @param month {Number} 当前日期的month(0-11)
         * @param vmodel {Number} 日历组件对应vmodel
         */
        onChangeMonthYear: avalon.noop,
        /**
         * @config {Function} 格式化输出日期单元格内容
         * @param date {Date} 当前的日期
         * @param vmodel {Vmodel} 日历组件对应vmodel
         * @param dateItem {Object} 对应的包含日期相关信息的对象
         */
        dateCellRender: false,
        // 是否可以自定义日历单元格内容
        watermark: true,
        //@config 是否显示水印文字
        zIndex: -1,
        //@config设置日历的z-index
        showDatepickerAlways: false,
        //@config是否总是显示datepicker
        timer: false,
        //@config 是否在组件中可选择时间
        /**
         * @config {Function} 选中日期后的回调
         * @param date {String} 当前选中的日期
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         * @param data {Object} 绑定组件的元素的data属性组成的集合
         */
        onSelect: avalon.noop,
        /**
         * @config {Function} 日历关闭的回调
         * @param date {Object} 当前日期
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         */
        onClose: avalon.noop,
        /**
         * @config {Function} 在设置了timer为true时，选择日期、时间后的回调
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         */
        onSelectTime: avalon.noop,
        /**
         * @config {Function} 将符合日期格式要求的字符串解析为date对象并返回，不符合格式的字符串返回null,用户可以根据自己需要自行配置解析过程
         * @param str {String} 要解析的日期字符串
         * @returns {Date} Date格式的日期
         */
        parseDate: parseDate,
        /**
         * @config {Function} 将日期对象转换为符合要求的日期字符串
         * @param date {Date} 要格式化的日期对象
         * @returns {String} 格式化后的日期
         */
        formatDate: function (date) {
            if (avalon.type(date) !== 'date') {
                avalon.log('the type of ' + date + 'must be Date');
                return '';
            }
            var separator = this.separator, year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            return year + separator + this.formatNum(month + 1, 2) + separator + this.formatNum(day, 2);
        },
        // 格式化month和day，使得其始终为两位数，比如2为02,1为01
        formatNum: function (n, length) {
            n = String(n);
            for (var i = 0, len = length - n.length; i < len; i++)
                n = '0' + n;
            return n;
        },
        widgetElement: '',
        // accordion容器
        formatErrorTip: '\u683C\u5F0F\u9519\u8BEF',
        getTemplate: function (str, options) {
            return str;
        }
    };
    avalon.filters.timer = function (str) {
        var num = +str;
        if (num >= 0 && num <= 9) {
            str = '0' + str;
        }
        return str;
    };
    function cleanDate(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    // 获取节日信息并设置相应显示，提供中文语言包对于节日的支持
    function initHoliday(data) {
        var _table = {}, _data = [];
        for (var k in data) {
            var v = data[k], _date = parseDate(k);
            if (_date) {
                v.date = _date;
                _data.push(v);
            }
        }
        _data.sort(function (a, b) {
            return (a.dayIndex || 0) - (b.dayIndex || 0);
        });
        for (var k = 0, len = _data.length; k < len; k++) {
            var v = _data[k], _date = v.date, beforeTime = v.beforeTime || 0, afterTime = v.afterTime || 0;
            _date.setDate(_date.getDate() - beforeTime - 1);
            for (var i = -v.beforeTime; i < afterTime + 1; i++) {
                _date.setDate(_date.getDate() + 1);
                _table[_date.getTime()] = {
                    text: v['holidayName'] + (i < 0 ? '\u524D' + -i + '\u5929' : i > 0 ? '\u540E' + i + '\u5929' : ''),
                    cellClass: i === 0 && v['holidayClass'] || '',
                    cellText: i === 0 && v['holidayText'] || ''
                };
            }
        }
        return _table;
    }
    function parseDate(str) {
        if (!str) {
            return null;
        }
        if (avalon.type(str) === 'date')
            return str;
        var separator = this.separator || '-';
        var reg = '^(\\d{4})' + separator + '(\\d{1,2})' + separator + '(\\d{1,2})[\\s\\w\\W]*$';
        reg = new RegExp(reg);
        var x = str.match(reg);
        return x ? new Date(x[1], x[2] * 1 - 1, x[3]) : null;
    }
    // 解析传入日期，如果是节日或者节日前三天和后三天只能，会相应的显示节日前几天信息，如果是今天就显示今天，其他情况显示日期对应的是周几
    function getDateTip(curDate) {
        if (!curDate)
            return;
        //如果没有传递语言设置，使用默认的语言包
        var regional;
        if (this.$id && this.regional) {
            regional = this.regional;
        } else {
            regional = widget.defaultRegional;
        }
        var holidays = regional.holidayDate || {};
        var now = cleanDate(new Date()).getTime(), curTime = curDate.getTime(), dayNames = regional.dayNames;
        if (now == curTime) {
            return {
                text: regional.currentDayFullText,
                cellClass: 'c_today',
                cellText: regional.currentDayText
            };
        } else if (now == curTime - ONE_DAY) {
            return {
                text: regional.nextDayText,
                cellClass: ''
            };
        } else if (now == curTime - ONE_DAY * 2) {
            return {
                text: regional.dayAfterTomorrow,
                cellClass: ''
            };
        }
        var tip = holidays && holidays[curDate.getTime()];
        if (!tip) {
            return { text: regional.weekDayNames[curDate.getDay()] };
        } else {
            return tip;
        }
    }
    ;
    return avalon;
}
)();