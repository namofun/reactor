import * as React from 'react';
import { ICalendar, ICalendarProps, ICalendarStrings, ICalendarIconStrings, ICalendarFormatDateCallbacks } from './Calendar.types';
import { DayOfWeek, FirstWeekOfYear, DateRangeType } from './DateValues';
import { CalendarDay, ICalendarDay } from './CalendarDay';
import { CalendarMonth, ICalendarMonth } from './CalendarMonth';
import { compareDates, getDateRangeArray } from './DateMath';
import { createRef } from './FabricUtil';
import { css, KeyCode } from 'azure-devops-ui/Util';
import "./Calendar.css";

const leftArrow = 'Up';
const rightArrow = 'Down';
const iconStrings: ICalendarIconStrings = {
  leftNavigation: leftArrow,
  rightNavigation: rightArrow
};
const defaultWorkWeekDays: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
];

const dateTimeFormatterCallbacks: ICalendarFormatDateCallbacks = {
  formatMonthDayYear: (date: Date, strings: ICalendarStrings) => (strings.months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()),
  formatMonthYear: (date: Date, strings: ICalendarStrings) => (strings.months[date.getMonth()] + ' ' + date.getFullYear()),
  formatDay: (date: Date) => date.getDate().toString(),
  formatYear: (date: Date) => date.getFullYear().toString()
};

export interface ICalendarState {
  /** The currently focused date in the day picker, but not necessarily selected */
  navigatedDayDate?: Date;

  /** The currently focused date in the month picker, but not necessarily selected */
  navigatedMonthDate?: Date;

  /** The currently selected date in the calendar */
  selectedDate?: Date;

  /** State used to show/hide month picker */
  isMonthPickerVisible?: boolean;

  /** State used to show/hide day picker */
  isDayPickerVisible?: boolean;
}

export class Calendar extends React.Component<ICalendarProps, ICalendarState> implements ICalendar {
  public static defaultProps: ICalendarProps = {
    onSelectDate: undefined,
    onDismiss: undefined,
    isMonthPickerVisible: true,
    isDayPickerVisible: true,
    showMonthPickerAsOverlay: false,
    value: undefined,
    today: new Date(),
    firstDayOfWeek: DayOfWeek.Sunday,
    dateRangeType: DateRangeType.Day,
    autoNavigateOnSelection: false,
    showGoToToday: true,
    strings: null,
    highlightCurrentMonth: false,
    highlightSelectedMonth: false,
    navigationIcons: iconStrings,
    showWeekNumbers: false,
    firstWeekOfYear: FirstWeekOfYear.FirstDay,
    dateTimeFormatter: dateTimeFormatterCallbacks,
    showSixWeeksByDefault: false,
    workWeekDays: defaultWorkWeekDays
  };

  private _dayPicker = createRef<ICalendarDay>();
  private _monthPicker = createRef<ICalendarMonth>();

  private _focusOnUpdate: boolean;

  constructor(props: ICalendarProps) {
    super(props);
    const currentDate = props.value && !isNaN(props.value.getTime()) ? props.value : (props.today || new Date());

    this.state = {
      selectedDate: currentDate,
      navigatedDayDate: currentDate,
      navigatedMonthDate: currentDate,

      /** When showMonthPickerAsOverlay is active it overrides isMonthPickerVisible/isDayPickerVisible props (These props permanently set the visibility of their respective calendars). */
      isMonthPickerVisible: this.props.showMonthPickerAsOverlay ? false : this.props.isMonthPickerVisible,
      isDayPickerVisible: this.props.showMonthPickerAsOverlay ? true : this.props.isDayPickerVisible
    };

    this._focusOnUpdate = false;
  }

  public componentWillReceiveProps(nextProps: ICalendarProps): void {
    const { autoNavigateOnSelection, value, today = new Date() } = nextProps;

    // Make sure auto-navigation is supported for programmatic changes to selected date, i.e.,
    // if selected date is updated via props, we may need to modify the navigated date
    const overrideNavigatedDate = (autoNavigateOnSelection && !compareDates(value!, this.props.value!));
    if (overrideNavigatedDate) {
      this.setState({
        navigatedMonthDate: value,
        navigatedDayDate: value
      });
    }

    this.setState({
      selectedDate: value || today
    });
  }

  public componentDidUpdate(): void {
    if (this._focusOnUpdate) {
      this.focus();
      this._focusOnUpdate = false;
    }
  }

  public render(): JSX.Element {
    const rootClass = 'ms-DatePicker';
    const { firstDayOfWeek, dateRangeType, strings, showMonthPickerAsOverlay, autoNavigateOnSelection, showGoToToday, highlightCurrentMonth, highlightSelectedMonth, navigationIcons, minDate, maxDate, className } = this.props;
    const { selectedDate, navigatedDayDate, navigatedMonthDate, isMonthPickerVisible, isDayPickerVisible } = this.state;
    const onHeaderSelect = showMonthPickerAsOverlay ? this._onHeaderSelect : undefined;
    const monthPickerOnly = !showMonthPickerAsOverlay && !isDayPickerVisible;
    const overlayedWithButton = showMonthPickerAsOverlay && showGoToToday;

    return (
      <div className={rootClass} role='application'>
        <div
          className={ css(
            'ms-DatePicker-picker ms-DatePicker-picker--opened ms-DatePicker-picker--focused',
            isMonthPickerVisible && 'ms-DatePicker-monthPickerVisible',
            isMonthPickerVisible && isDayPickerVisible && 'ms-DatePicker-calendarsInline',
            monthPickerOnly && 'ms-DatePicker-monthPickerOnly',
            showMonthPickerAsOverlay && 'ms-DatePicker-monthPickerAsOverlay',
          ) }
        >
          <div className={ css('ms-DatePicker-holder ms-slideDownIn10', overlayedWithButton && 'ms-DatePicker-holderWithButton') } onKeyDown={ this._onDatePickerPopupKeyDown }>
            <div className="ms-DatePicker-frame">
              <div className={ css('ms-DatePicker-wrap', showGoToToday && 'ms-DatePicker-goTodaySpacing') }>
                { isDayPickerVisible && <CalendarDay
                  selectedDate={ selectedDate! }
                  navigatedDate={ navigatedDayDate! }
                  today={ this.props.today }
                  onSelectDate={ this._onSelectDate }
                  onNavigateDate={ this._onNavigateDayDate }
                  onDismiss={ this.props.onDismiss }
                  firstDayOfWeek={ firstDayOfWeek! }
                  dateRangeType={ dateRangeType! }
                  autoNavigateOnSelection={ autoNavigateOnSelection! }
                  strings={ strings! }
                  onHeaderSelect={ onHeaderSelect }
                  navigationIcons={ navigationIcons! }
                  showWeekNumbers={ this.props.showWeekNumbers }
                  firstWeekOfYear={ this.props.firstWeekOfYear! }
                  dateTimeFormatter={ this.props.dateTimeFormatter! }
                  showSixWeeksByDefault={ this.props.showSixWeeksByDefault }
                  minDate={ minDate }
                  maxDate={ maxDate }
                  workWeekDays={ this.props.workWeekDays }
                  componentRef={ this._dayPicker }
                />
                }
                { isDayPickerVisible && isMonthPickerVisible && <div className="ms-DatePicker-divider" /> }
                { isMonthPickerVisible &&
                  <CalendarMonth
                    navigatedDate={ navigatedMonthDate! }
                    selectedDate={ navigatedDayDate! }
                    strings={ strings! }
                    onNavigateDate={ this._onNavigateMonthDate }
                    today={ this.props.today }
                    highlightCurrentMonth={ highlightCurrentMonth! }
                    highlightSelectedMonth={ highlightSelectedMonth! }
                    onHeaderSelect={ onHeaderSelect }
                    navigationIcons={ navigationIcons! }
                    dateTimeFormatter={ this.props.dateTimeFormatter! }
                    minDate={ minDate }
                    maxDate={ maxDate }
                    componentRef={ this._monthPicker }
                  /> }

                { showGoToToday &&
                  <button
                    role='button'
                    className={ css('ms-DatePicker-goToday js-goToday', isMonthPickerVisible && 'ms-DatePicker-goTodayInlineMonth') }
                    onClick={ this._onGotoToday }
                    onKeyDown={ this._onGotoTodayKeyDown }
                    tabIndex={ 0 }
                  >
                    { strings!.goToToday }
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  public focus() {
    if (this.state.isDayPickerVisible && this._dayPicker.current) {
      this._dayPicker.current.focus();
    } else if (this.state.isMonthPickerVisible && this._monthPicker.current) {
      this._monthPicker.current.focus();
    }
  }

  private _navigateDayPickerDay = (date: Date): void => {
    this.setState({
      navigatedDayDate: date,
      navigatedMonthDate: date
    });
  }

  private _navigateMonthPickerDay = (date: Date): void => {
    this.setState({
      navigatedMonthDate: date
    });
  }

  private _onNavigateDayDate = (date: Date, focusOnNavigatedDay: boolean): void => {
    this._navigateDayPickerDay(date);
    this._focusOnUpdate = focusOnNavigatedDay;
  }

  private _onNavigateMonthDate = (date: Date, focusOnNavigatedDay: boolean): void => {
    if (!focusOnNavigatedDay) {
      this._navigateMonthPickerDay(date);
      this._focusOnUpdate = focusOnNavigatedDay;
      return;
    }
    if (!this.state.isDayPickerVisible) {
      this._onSelectDate(date);
    }

    this._navigateDayPickerDay(date);
  }

  private _onSelectDate = (date: Date, selectedDateRangeArray?: Date[]): void => {
    const { onSelectDate } = this.props;

    this.setState({
      selectedDate: date
    });

    if (onSelectDate) {
      onSelectDate(date, selectedDateRangeArray);
    }
  }

  private _onHeaderSelect = (focus: boolean): void => {
    this.setState({
      isDayPickerVisible: !this.state.isDayPickerVisible,
      isMonthPickerVisible: !this.state.isMonthPickerVisible
    });

    if (focus) {
      this._focusOnUpdate = true;
    }
  }

  private _onGotoToday = (): void => {
    const { dateRangeType, firstDayOfWeek, today, workWeekDays } = this.props;

    const dates = getDateRangeArray(today!, dateRangeType!, firstDayOfWeek!, workWeekDays!);

    this._onSelectDate(today!, dates);
    this._navigateDayPickerDay(today!);
  }

  private _onGotoTodayKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      ev.preventDefault();
      this._onGotoToday();
    }
  }

  private _onDatePickerPopupKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    switch (ev.which) {
      case KeyCode.enter:
        ev.preventDefault();
        break;

      case KeyCode.backspace:
        ev.preventDefault();
        break;

      case KeyCode.escape:
        this._handleEscKey(ev);
        break;

      default:
        break;
    }
  }

  private _handleEscKey = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }
}
