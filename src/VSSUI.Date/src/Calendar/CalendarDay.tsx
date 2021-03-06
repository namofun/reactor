import * as React from 'react';
import { getId, format } from './FabricUtil';
import { ICalendarStrings, ICalendarIconStrings, ICalendarFormatDateCallbacks } from './Calendar.types';
import { DayOfWeek, FirstWeekOfYear, DateRangeType } from './DateValues';
import { FocusZone } from 'azure-devops-ui/FocusZone';
import { Icon } from 'azure-devops-ui/Icon';
import { css, KeyCode } from 'azure-devops-ui/Util';
import {
  addDays,
  addWeeks,
  addMonths,
  compareDates,
  compareDatePart,
  getDateRangeArray,
  isInDateRangeArray,
  getWeekNumber,
  getWeekNumbersInMonth,
  getMonthStart,
  getMonthEnd
} from './DateMath';

import "./Calendar.css";

const DAYS_IN_WEEK = 7;

export interface IDayInfo {
  key: string;
  date: string;
  originalDate: Date;
  isInMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInBounds: boolean;
  onSelected: () => void;
}

export interface ICalendarDay {
  focus(): void;
}

export interface ICalendarDayProps extends React.Props<CalendarDay> {
  componentRef?: (c: ICalendarDay) => void;
  strings: ICalendarStrings;
  selectedDate: Date;
  navigatedDate: Date;
  onSelectDate: (date: Date, selectedDateRangeArray?: Date[]) => void;
  onNavigateDate: (date: Date, focusOnNavigatedDay: boolean) => void;
  onDismiss?: () => void;
  firstDayOfWeek: DayOfWeek;
  dateRangeType: DateRangeType;
  autoNavigateOnSelection: boolean;
  navigationIcons: ICalendarIconStrings;
  today?: Date;
  onHeaderSelect?: (focus: boolean) => void;
  showWeekNumbers?: boolean;
  firstWeekOfYear: FirstWeekOfYear;
  dateTimeFormatter: ICalendarFormatDateCallbacks;
  showSixWeeksByDefault?: boolean;
  minDate?: Date;
  maxDate?: Date;
  workWeekDays?: DayOfWeek[];
}

export interface ICalendarDayState {
  activeDescendantId?: string;
  weeks?: IDayInfo[][];
}

interface IWeekCorners {
  [key: string]: string;
}

export class CalendarDay extends React.Component<ICalendarDayProps, ICalendarDayState> {
  private navigatedDay: HTMLElement | null;
  private days: { [key: string]: HTMLElement | null } = {};

  public constructor(props: ICalendarDayProps) {
    super(props);

    this.state = {
      activeDescendantId: getId('DatePickerDay-active'),
      weeks: this._getWeeks(props)
    };

    this._onSelectNextMonth = this._onSelectNextMonth.bind(this);
    this._onSelectPrevMonth = this._onSelectPrevMonth.bind(this);
  }

  public componentWillReceiveProps(nextProps: ICalendarDayProps): void {
    this.setState({
      weeks: this._getWeeks(nextProps)
    });
  }

  public render(): JSX.Element {
    const { activeDescendantId, weeks } = this.state;
    const { firstDayOfWeek, strings, navigatedDate, selectedDate, dateRangeType, navigationIcons, showWeekNumbers, firstWeekOfYear, dateTimeFormatter, minDate, maxDate } = this.props;
    const dayPickerId = getId('DatePickerDay-dayPicker');
    const monthAndYearId = getId('DatePickerDay-monthAndYear');
    const leftNavigationIcon = navigationIcons.leftNavigation;
    const rightNavigationIcon = navigationIcons.rightNavigation;
    const weekNumbers = showWeekNumbers ? getWeekNumbersInMonth(weeks!.length, firstDayOfWeek, firstWeekOfYear, navigatedDate) : null;
    const selectedDateWeekNumber = showWeekNumbers ? getWeekNumber(selectedDate, firstDayOfWeek, firstWeekOfYear) : undefined;

    // When the month is highlighted get the corner dates so that styles can be added to them
    const weekCorners: IWeekCorners = this._getWeekCornerStyles(weeks!, dateRangeType);

    // determine if previous/next months are in bounds
    const prevMonthInBounds = minDate ? compareDatePart(minDate, getMonthStart(navigatedDate)) < 0 : true;
    const nextMonthInBounds = maxDate ? compareDatePart(getMonthEnd(navigatedDate), maxDate) < 0 : true;

    return (
      <div
        className={ css('ms-DatePicker-dayPicker', showWeekNumbers && 'ms-DatePicker-showWeekNumbers') }
        id={ dayPickerId }
      >
        <div className="ms-DatePicker-header">
          <div aria-live='polite' aria-relevant='text' aria-atomic='true' id={ monthAndYearId } className="ms-DatePicker-monthAndYear" >
            { this.props.onHeaderSelect ?
              <div
                className="ms-DatePicker-monthAndYear js-showMonthPicker ms-DatePicker-headerToggleView"
                onClick={ this._onHeaderSelect }
                onKeyDown={ this._onHeaderKeyDown }
                aria-label={ dateTimeFormatter.formatMonthYear(navigatedDate, strings) }
                role='button'
                tabIndex={ 0 }
              >
                { dateTimeFormatter.formatMonthYear(navigatedDate, strings) }
              </div>
              :
              <div className="ms-DatePicker-monthAndYear">
                { dateTimeFormatter.formatMonthYear(navigatedDate, strings) }
              </div>
            }
          </div>
          <div className="ms-DatePicker-monthComponents">
            <div className='ms-DatePicker-navContainer'>
              <button
                className={ css('ms-DatePicker-prevMonth', 'js-prevMonth', !prevMonthInBounds && 'ms-DatePicker-prevMonth--disabled') }
                disabled={ !prevMonthInBounds }
                onClick={ prevMonthInBounds ? this._onSelectPrevMonth : undefined }
                onKeyDown={ prevMonthInBounds ? this._onPrevMonthKeyDown : undefined }
                aria-controls={ dayPickerId }
                aria-label={ strings.prevMonthAriaLabel ? strings.prevMonthAriaLabel + ' ' + strings.months[addMonths(navigatedDate, -1).getMonth()] : undefined }
                role='button'
              >
                <Icon iconName={ leftNavigationIcon } />
              </button >
              <button
                className={ css('ms-DatePicker-nextMonth js-nextMonth', !nextMonthInBounds && 'ms-DatePicker-nextMonth--disabled') }
                disabled={ !nextMonthInBounds }
                onClick={ nextMonthInBounds ? this._onSelectNextMonth : undefined }
                onKeyDown={ nextMonthInBounds ? this._onNextMonthKeyDown : undefined }
                aria-controls={ dayPickerId }
                aria-label={ strings.nextMonthAriaLabel ? strings.nextMonthAriaLabel + ' ' + strings.months[addMonths(navigatedDate, 1).getMonth()] : undefined }
                role='button'
              >
                <Icon iconName={ rightNavigationIcon } />
              </button >
            </div >
          </div >
        </div>
        <FocusZone>
          <table
            className="ms-DatePicker-table"
            aria-readonly='true'
            aria-multiselectable='false'
            aria-labelledby={ monthAndYearId }
            aria-activedescendant={ activeDescendantId }
          >
            <thead>
              <tr>
                { showWeekNumbers && <th className="ms-DatePicker-weekday" /> }
                { strings.shortDays.map((val, index) =>
                  <th
                    className="ms-DatePicker-weekday"
                    role='grid'
                    scope='col'
                    key={ index }
                    title={ strings.days[(index + firstDayOfWeek) % DAYS_IN_WEEK] }
                    aria-label={ strings.days[(index + firstDayOfWeek) % DAYS_IN_WEEK] }
                  >
                    { strings.shortDays[(index + firstDayOfWeek) % DAYS_IN_WEEK] }
                  </th>) }
              </tr>
            </thead>
            <tbody
              onMouseLeave={ dateRangeType !== DateRangeType.Day ? this._onTableMouseLeave : undefined }
              onMouseUp={ dateRangeType !== DateRangeType.Day ? this._onTableMouseUp : undefined }
            >
              { weeks!.map((week, weekIndex) =>
                <tr
                  key={ weekNumbers ? weekNumbers[weekIndex] : weekIndex }
                  role='row'
                >
                  { showWeekNumbers && weekNumbers &&
                    <th
                      className="ms-DatePicker-weekNumbers ms-DatePicker-weekday"
                      key={ weekIndex }
                      title={ weekNumbers && strings.weekNumberFormatString && format(strings.weekNumberFormatString, weekNumbers[weekIndex]) }
                      aria-label={ weekNumbers && strings.weekNumberFormatString && format(strings.weekNumberFormatString, weekNumbers[weekIndex]) }
                      scope='row'
                    >
                      <div className={ css('ms-DatePicker-day', selectedDateWeekNumber === weekNumbers[weekIndex] && 'ms-DatePicker-week--highlighted') }>
                        <span>{ weekNumbers[weekIndex] }</span>
                      </div>
                    </th>
                  }
                  { week.map((day, dayIndex) => {
                    const isNavigatedDate = compareDates(navigatedDate, day.originalDate);
                    return <td
                      key={ day.key }
                      className={ css(
                        'ms-DatePicker-dayWrapper',
                        'ms-DatePicker-day',
                        this._getHighlightedCornerStyle(weekCorners, dayIndex, weekIndex),
                        day.isSelected && (dateRangeType === DateRangeType.Week || dateRangeType === DateRangeType.WorkWeek) && 'ms-DatePicker-weekBackground',
                        dateRangeType === DateRangeType.Day && 'ms-DatePicker-dayBackground',
                        day.isSelected && dateRangeType === DateRangeType.Day && 'ms-DatePicker-day--highlighted',
                        !day.isInBounds && 'ms-DatePicker-day--disabled',
                        day.isInBounds && day.isInMonth && 'ms-DatePicker-day--infocus',
                        day.isInBounds && !day.isInMonth && 'ms-DatePicker-day--outfocus'
                      ) }
                      ref={ element => this._setDayCellRef(element, day, isNavigatedDate) }
                      onClick={ day.isInBounds ? day.onSelected : undefined }
                      onMouseOver={ dateRangeType !== DateRangeType.Day ? this._onDayMouseOver(day.originalDate, weekIndex, dayIndex, dateRangeType) : undefined }
                      onMouseLeave={ dateRangeType !== DateRangeType.Day ? this._onDayMouseLeave(day.originalDate, weekIndex, dayIndex, dateRangeType) : undefined }
                      onMouseDown={ dateRangeType !== DateRangeType.Day ? this._onDayMouseDown(day.originalDate, weekIndex, dayIndex, dateRangeType) : undefined }
                      onMouseUp={ dateRangeType !== DateRangeType.Day ? this._onDayMouseUp(day.originalDate, weekIndex, dayIndex, dateRangeType) : undefined }
                    >
                      <div
                        key={ day.key + 'div' }
                        className={ css('ms-DatePicker-day', day.isToday && 'ms-DatePicker-day--today') }
                        role={ 'gridcell' }
                        onKeyDown={ this._onDayKeyDown(day.originalDate, weekIndex, dayIndex) }
                        aria-label={ dateTimeFormatter.formatMonthDayYear(day.originalDate, strings) }
                        id={ isNavigatedDate ? activeDescendantId : undefined }
                        aria-selected={ day.isInBounds ? day.isSelected : undefined }
                        data-is-focusable={ day.isInBounds ? true : undefined }
                        ref={ element => this._setDayRef(element, day, isNavigatedDate) }
                      >
                        <span aria-hidden='true'>{ dateTimeFormatter.formatDay(day.originalDate) }</span>
                      </div>
                    </td>;
                  }) }
                </tr>
              ) }
            </tbody>
          </table>
        </FocusZone>
      </div >
    );
  }

  public focus() {
    if (this.navigatedDay) {
      this.navigatedDay.tabIndex = 0;
      this.navigatedDay.focus();
    }
  }

  private _setDayRef(element: HTMLElement | null, day: IDayInfo, isNavigatedDate: boolean): void {
    if (isNavigatedDate) {
      this.navigatedDay = element;
    }
  }

  private _setDayCellRef(element: HTMLElement | null, day: IDayInfo, isNavigatedDate: boolean): void {
    this.days[day.key] = element;
  }

  private _getWeekCornerStyles(weeks: IDayInfo[][], dateRangeType: DateRangeType): IWeekCorners {
    const weekCornersStyled: any = {};

    switch (dateRangeType) {
      case DateRangeType.Month:
        /* need to handle setting all of the corners on arbitrarily shaped blobs
              __
           __|A |
          |B |C |__
          |D |E |F |

          in this case, A needs top left rounded, top right rounded
          B needs top left rounded
          C doesn't need any rounding
          D needs bottom left rounded
          E doesn't need any rounding
          F needs top right rounding
        */

        // if there's an item above, lose both top corners. Item below, lose both bottom corners, etc.
        weeks.forEach((week: IDayInfo[], weekIndex: number) => {
          week.forEach((day: IDayInfo, dayIndex: number) => {
            const above = weeks[weekIndex - 1] && weeks[weekIndex - 1][dayIndex] && weeks[weekIndex - 1][dayIndex].originalDate.getMonth() === weeks[weekIndex][dayIndex].originalDate.getMonth();
            const below = weeks[weekIndex + 1] && weeks[weekIndex + 1][dayIndex] && weeks[weekIndex + 1][dayIndex].originalDate.getMonth() === weeks[weekIndex][dayIndex].originalDate.getMonth();
            const left = weeks[weekIndex][dayIndex - 1] && weeks[weekIndex][dayIndex - 1].originalDate.getMonth() === weeks[weekIndex][dayIndex].originalDate.getMonth();
            const right = weeks[weekIndex][dayIndex + 1] && weeks[weekIndex][dayIndex + 1].originalDate.getMonth() === weeks[weekIndex][dayIndex].originalDate.getMonth();

            const roundedTopLeft = !above && !left;
            const roundedTopRight = !above && !right;
            const roundedBottomLeft = !below && !left;
            const roundedBottomRight = !below && !right;

            let style = '';
            if (roundedTopLeft) {
              style = style.concat('ms-DatePicker-topLeftCornerDate ');
            }
            if (roundedTopRight) {
              style = style.concat('ms-DatePicker-topRightCornerDate ');
            }
            if (roundedBottomLeft) {
              style = style.concat('ms-DatePicker-bottomLeftCornerDate ');
            }
            if (roundedBottomRight) {
              style = style.concat('ms-DatePicker-bottomRightCornerDate ');
            }

            weekCornersStyled[weekIndex + '_' + dayIndex] = style;
          });
        });
        break;
      case DateRangeType.Week:
      case DateRangeType.WorkWeek:
        weeks.forEach((week: IDayInfo[], weekIndex: number) => {
          const leftStyle = 'ms-DatePicker-topLeftCornerDate ms-DatePicker-bottomLeftCornerDate';
          const rightStyle = 'ms-DatePicker-topRightCornerDate ms-DatePicker-bottomRightCornerDate';
          weekCornersStyled[weekIndex + '_' + 0] = leftStyle;
          weekCornersStyled[weekIndex + '_' + (DAYS_IN_WEEK - 1)] = rightStyle;
        });
        break;
    }

    return weekCornersStyled;
  }

  private _getHighlightedCornerStyle(weekCorners: IWeekCorners, dayIndex: number, weekIndex: number): string {
    const cornerStyle = weekCorners[weekIndex + '_' + dayIndex] ? weekCorners[weekIndex + '_' + dayIndex] : '';
    return cornerStyle;
  }

  private _navigateMonthEdge(ev: React.KeyboardEvent<HTMLElement>, date: Date, weekIndex: number, dayIndex: number): void {
    const { minDate, maxDate } = this.props;
    let targetDate: Date | undefined = undefined;

    if (weekIndex === 0 && ev.which === KeyCode.upArrow) {
      targetDate = addWeeks(date, -1);
    } else if (weekIndex === (this.state.weeks!.length - 1) && ev.which === KeyCode.downArrow) {
      targetDate = addWeeks(date, 1);
    } else if (dayIndex === 0 && ev.which === KeyCode.leftArrow) {
      targetDate = addDays(date, -1);
    } else if (dayIndex === (DAYS_IN_WEEK - 1) && ev.which === KeyCode.rightArrow) {
      targetDate = addDays(date, 1);
    }

    // Don't navigate to out-of-bounds date
    if (targetDate && (minDate ? compareDatePart(minDate, targetDate) < 1 : true) && (maxDate ? compareDatePart(targetDate, maxDate) < 1 : true)) {
      this.props.onNavigateDate(targetDate, true);
      ev.preventDefault();
    }
  }

  private _onKeyDown = (callback: () => void, ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter || ev.which === KeyCode.space) {
      callback();
    }
  }

  private _onDayKeyDown = (originalDate: Date, weekIndex: number, dayIndex: number)
    : (ev: React.KeyboardEvent<HTMLElement>) => void => {
    return (ev: React.KeyboardEvent<HTMLElement>): void => {
      this._navigateMonthEdge(ev, originalDate, weekIndex, dayIndex);
    };
  }

  private _onDayMouseDown = (originalDate: Date, weekIndex: number, dayIndex: number, dateRangeType: DateRangeType)
    : (ev: React.MouseEvent<HTMLElement>) => void => {
    return (ev: React.MouseEvent<HTMLElement>): void => {
      // set the press styling
      if (dateRangeType === DateRangeType.Month) {
        this._applyFunctionToDayRefs((ref, day) => {
          if (ref && day.originalDate.getMonth() === originalDate.getMonth()) {
            ref.classList.add('ms-DatePicker-dayPress');
          }
        });
      } else {
        // week or work week view
        this._applyFunctionToDayRefs((ref, day, dayWeekIndex) => {
          if (ref && dayWeekIndex === weekIndex) {
            ref.classList.add('ms-DatePicker-dayPress');
            ref.classList.add('ms-DatePicker-day--highlighted');
          } else if (ref) {
            ref.classList.remove('ms-DatePicker-day--highlighted');
          }
        });
      }
    };
  }

  private _onDayMouseUp = (originalDate: Date, weekIndex: number, dayIndex: number, dateRangeType: DateRangeType)
    : (ev: React.MouseEvent<HTMLElement>) => void => {
    return (ev: React.MouseEvent<HTMLElement>): void => {
      // remove press styling
      if (dateRangeType === DateRangeType.Month) {
        this._applyFunctionToDayRefs((ref, day) => {
          if (ref && day.originalDate.getMonth() === originalDate.getMonth()) {
            ref.classList.remove('ms-DatePicker-dayPress');
          }
        });
      } else {
        // week or work week view
        this._applyFunctionToDayRefs((ref, day, dayWeekIndex) => {
          if (ref && dayWeekIndex === weekIndex) {
            ref.classList.remove('ms-DatePicker-dayPress');
          }
        });
      }
    };
  }

  private _onDayMouseOver = (originalDate: Date, weekIndex: number, dayIndex: number, dateRangeType: DateRangeType)
    : (ev: React.MouseEvent<HTMLElement>) => void => {
    return (ev: React.MouseEvent<HTMLElement>): void => {
      // set the hover styling on every day in the same month
      if (dateRangeType === DateRangeType.Month) {
        this._applyFunctionToDayRefs((ref, day) => {
          if (ref && day.originalDate.getMonth() === originalDate.getMonth()) {
            ref.classList.add('ms-DatePicker-dayHover');
          }
        });
      } else {
        // week or work week view
        this._applyFunctionToDayRefs((ref, day, dayWeekIndex) => {
          if (ref && dayWeekIndex === weekIndex) {
            ref.classList.add('ms-DatePicker-dayHover');
          }
        });
      }
    };
  }

  private _onDayMouseLeave = (originalDate: Date, weekIndex: number, dayIndex: number, dateRangeType: DateRangeType)
    : (ev: React.MouseEvent<HTMLElement>) => void => {
    return (ev: React.MouseEvent<HTMLElement>): void => {
      // remove the hover and pressed styling
      if (dateRangeType === DateRangeType.Month) {
        this._applyFunctionToDayRefs((ref, day) => {
          if (ref && day.originalDate.getMonth() === originalDate.getMonth()) {
            ref.classList.remove('ms-DatePicker-dayHover');
          }
        });
      } else {
        // week or work week view
        this._applyFunctionToDayRefs((ref, day, dayWeekIndex) => {
          if (ref && dayWeekIndex === weekIndex) {
            ref.classList.remove('ms-DatePicker-dayHover');
          }
        });
      }
    };
  }

  private _onTableMouseLeave = (ev: React.MouseEvent<HTMLElement>): void => {
    if ((ev.target as HTMLElement).contains && ev.relatedTarget && (ev.relatedTarget as HTMLElement).contains && (ev.target as HTMLElement).contains(ev.relatedTarget as HTMLElement)) {
      return;
    }

    this._applyFunctionToDayRefs((ref, day) => {
      if (ref) {
        ref.classList.remove('ms-DatePicker-dayHover');
        ref.classList.remove('ms-DatePicker-dayPress');
      }
    });
  }

  private _onTableMouseUp = (ev: React.MouseEvent<HTMLElement>): void => {
    if ((ev.target as HTMLElement).contains && ev.relatedTarget && (ev.relatedTarget as HTMLElement).contains && (ev.target as HTMLElement).contains(ev.relatedTarget as HTMLElement)) {
      return;
    }

    this._applyFunctionToDayRefs((ref, day) => {
      if (ref) {
        ref.classList.remove('ms-DatePicker-dayPress');
      }
    });
  }

  private _applyFunctionToDayRefs(func: (ref: HTMLElement | null, day: IDayInfo, weekIndex?: number) => void) {
    if (this.state.weeks) {
      this.state.weeks.map((week: IDayInfo[], weekIndex: number) => {
        week.map(day => {
          const ref = this.days[day.key];
          func(ref, day, weekIndex);
        });
      });
    }
  }

  private _onSelectDate = (selectedDate: Date): void => {
    const {
      onSelectDate,
      dateRangeType,
      firstDayOfWeek,
      navigatedDate,
      autoNavigateOnSelection,
      minDate,
      maxDate,
      workWeekDays
    } = this.props;

    let dateRange = getDateRangeArray(selectedDate, dateRangeType, firstDayOfWeek, workWeekDays);
    if (dateRangeType !== DateRangeType.Day) {
      dateRange = this._getBoundedDateRange(dateRange, minDate, maxDate);
    }

    if (onSelectDate) {
      onSelectDate(selectedDate, dateRange);
    }

    // Navigate to next or previous month if needed
    if (autoNavigateOnSelection && selectedDate.getMonth() !== navigatedDate.getMonth()) {
      const compareResult = compareDatePart(selectedDate, navigatedDate);
      if (compareResult < 0) {
        this._onSelectPrevMonth();
      } else if (compareResult > 0) {
        this._onSelectNextMonth();
      }
    }
  }

  private _onSelectNextMonth = (): void => {
    this.props.onNavigateDate(addMonths(this.props.navigatedDate, 1), false);
  }

  private _onSelectPrevMonth = (): void => {
    this.props.onNavigateDate(addMonths(this.props.navigatedDate, -1), false);
  }

  private _onHeaderSelect = (): void => {
    const { onHeaderSelect } = this.props;
    if (onHeaderSelect) {
      onHeaderSelect(true);
    }
  }

  private _onHeaderKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    const { onHeaderSelect } = this.props;
    if (onHeaderSelect && (ev.which === KeyCode.enter || ev.which === KeyCode.space)) {
      onHeaderSelect(true);
    }
  }

  private _onPrevMonthKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      this._onKeyDown(this._onSelectPrevMonth, ev);
    }
  }

  private _onNextMonthKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      this._onKeyDown(this._onSelectNextMonth, ev);
    }
  }

  private _getWeeks(propsToUse: ICalendarDayProps): IDayInfo[][] {
    const {
      navigatedDate,
      selectedDate,
      dateRangeType,
      firstDayOfWeek,
      today,
      minDate,
      maxDate,
      showSixWeeksByDefault,
      workWeekDays
    } = propsToUse;
    const date = new Date(navigatedDate.getFullYear(), navigatedDate.getMonth(), 1);
    const todaysDate = today || new Date();
    const weeks: IDayInfo[][] = [];

    // Cycle the date backwards to get to the first day of the week.
    while (date.getDay() !== firstDayOfWeek) {
      date.setDate(date.getDate() - 1);
    }

    // a flag to indicate whether all days of the week are in the month
    let isAllDaysOfWeekOutOfMonth = false;

    // in work week view we want to select the whole week
    const selectedDateRangeType = dateRangeType === DateRangeType.WorkWeek ? DateRangeType.Week : dateRangeType;
    let selectedDates = getDateRangeArray(selectedDate, selectedDateRangeType, firstDayOfWeek, workWeekDays);
    if (dateRangeType !== DateRangeType.Day) {
      selectedDates = this._getBoundedDateRange(selectedDates, minDate, maxDate);
    }

    let shouldGetWeeks = true;

    for (let weekIndex = 0; shouldGetWeeks; weekIndex++) {
      const week: IDayInfo[] = [];

      isAllDaysOfWeekOutOfMonth = true;

      for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex++) {
        const originalDate = new Date(date.toString());
        const dayInfo: IDayInfo = {
          key: date.toString(),
          date: date.getDate().toString(),
          originalDate: originalDate,
          isInMonth: date.getMonth() === navigatedDate.getMonth(),
          isToday: compareDates(todaysDate, date),
          isSelected: isInDateRangeArray(date, selectedDates),
          onSelected: this._onSelectDate.bind(this, originalDate),
          isInBounds: (minDate ? compareDatePart(minDate, date) < 1 : true) && (maxDate ? compareDatePart(date, maxDate) < 1 : true)
        };

        week.push(dayInfo);

        if (dayInfo.isInMonth) {
          isAllDaysOfWeekOutOfMonth = false;
        }

        date.setDate(date.getDate() + 1);
      }

      // We append the condition of the loop depending upon the showSixWeeksByDefault prop.
      shouldGetWeeks = showSixWeeksByDefault ? (!isAllDaysOfWeekOutOfMonth || weekIndex <= 5) : !isAllDaysOfWeekOutOfMonth;
      if (shouldGetWeeks) {
        weeks.push(week);
      }
    }

    return weeks;
  }

  private _getBoundedDateRange(dateRange: Date[], minDate?: Date, maxDate?: Date): Date[] {
    let boundedDateRange = [...dateRange];
    if (minDate) {
      boundedDateRange = boundedDateRange.filter((date) => compareDatePart(date, minDate as Date) >= 0);
    }
    if (maxDate) {
      boundedDateRange = boundedDateRange.filter((date) => compareDatePart(date, maxDate as Date) <= 0);
    }
    return boundedDateRange;
  }
}