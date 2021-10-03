import * as React from 'react';
import { KeyCode, css } from './FabricUtil';
import { ICalendarStrings, ICalendarIconStrings, ICalendarFormatDateCallbacks } from './Calendar.types';
import { FocusZone } from 'azure-devops-ui/FocusZone';
import { addYears, setMonth, getYearStart, getYearEnd, getMonthStart, getMonthEnd, compareDatePart } from './DateMath';
import { Icon } from 'azure-devops-ui/Icon';
import "./Calendar.css";

export interface ICalendarMonth {
  focus(): void;
}

export interface ICalendarMonthProps extends React.Props<CalendarMonth> {
  componentRef?: (c: ICalendarMonth) => void;
  navigatedDate: Date;
  selectedDate: Date;
  strings: ICalendarStrings;
  onNavigateDate: (date: Date, focusOnNavigatedDay: boolean) => void;
  today?: Date;
  highlightCurrentMonth: boolean;
  highlightSelectedMonth: boolean;
  onHeaderSelect?: (focus: boolean) => void;
  navigationIcons: ICalendarIconStrings;
  dateTimeFormatter: ICalendarFormatDateCallbacks;
  minDate?: Date;
  maxDate?: Date;
}

export class CalendarMonth extends React.Component<ICalendarMonthProps, {}> {
  public refs: {
    [key: string]: React.ReactInstance;
    navigatedMonth: HTMLElement;
  };

  private _selectMonthCallbacks: (() => void)[];

  public constructor(props: ICalendarMonthProps) {
    super(props);

    this._selectMonthCallbacks = [];
    props.strings.shortMonths.map((month, index) => {
      this._selectMonthCallbacks[index] = this._onSelectMonth.bind(this, index);
    });

    this._isCurrentMonth = this._isCurrentMonth.bind(this);
    this._onSelectNextYear = this._onSelectNextYear.bind(this);
    this._onSelectPrevYear = this._onSelectPrevYear.bind(this);
    this._onSelectMonth = this._onSelectMonth.bind(this);
  }

  public render(): JSX.Element {

    const { navigatedDate, selectedDate, strings, today, highlightCurrentMonth, highlightSelectedMonth, navigationIcons, dateTimeFormatter, minDate, maxDate } = this.props;
    const leftNavigationIcon = navigationIcons.leftNavigation;
    const rightNavigationIcon = navigationIcons.rightNavigation;

    // determine if previous/next years are in bounds
    const isPrevYearInBounds = minDate ? compareDatePart(minDate, getYearStart(navigatedDate)) < 0 : true;
    const isNextYearInBounds = maxDate ? compareDatePart(getYearEnd(navigatedDate), maxDate) < 0 : true;

    return (
      <div className="ms-DatePicker-monthPicker">
        <div className="ms-DatePicker-header">
          { this.props.onHeaderSelect ?
            <div
              className="ms-DatePicker-currentYear js-showYearPicker ms-DatePicker-headerToggleView"
              onClick={ this._onHeaderSelect }
              onKeyDown={ this._onHeaderKeyDown }
              aria-label={ dateTimeFormatter.formatYear(navigatedDate) }
              role='button'
              tabIndex={ 0 }
            >
              { dateTimeFormatter.formatYear(navigatedDate) }
            </div>
            :
            <div className="ms-DatePicker-currentYear js-showYearPicker">
              { dateTimeFormatter.formatYear(navigatedDate) }
            </div>
          }
          <div className="ms-DatePicker-yearComponents">
            <div className='ms-DatePicker-navContainer'>
              <button
                className={ css('ms-DatePicker-prevYear', 'js-prevYear', !isPrevYearInBounds && 'ms-DatePicker-prevYear--disabled') }
                disabled={ !isPrevYearInBounds }
                onClick={ isPrevYearInBounds ? this._onSelectPrevYear : undefined }
                onKeyDown={ isPrevYearInBounds ? this._onSelectPrevYearKeyDown : undefined }
                aria-label={ strings.prevYearAriaLabel ? strings.prevYearAriaLabel + ' ' + dateTimeFormatter.formatYear(addYears(navigatedDate, -1)) : undefined }
                role='button'
              >
                <Icon iconName={ leftNavigationIcon } />
              </button>
              <button
                className={ css('ms-DatePicker-nextYear', 'js-nextYear', !isNextYearInBounds && 'ms-DatePicker-nextYear--disabled') }
                disabled={ !isNextYearInBounds }
                onClick={ isNextYearInBounds ? this._onSelectNextYear : undefined }
                onKeyDown={ isNextYearInBounds ? this._onSelectNextYearKeyDown : undefined }
                aria-label={ strings.nextYearAriaLabel ? strings.nextYearAriaLabel + ' ' + dateTimeFormatter.formatYear(addYears(navigatedDate, 1)) : undefined }
                role='button'
              >
                <Icon iconName={ rightNavigationIcon } />
              </button>
            </div>
          </div>
        </div>
        <FocusZone>
          <div
            className="ms-DatePicker-optionGrid"
            role='grid'
          >
            { strings.shortMonths.map((month, index) => {

              const indexedMonth = setMonth(navigatedDate, index);
              const isCurrentMonth = this._isCurrentMonth(index, navigatedDate.getFullYear(), today!);
              const isNavigatedMonth = navigatedDate.getMonth() === index;
              const isSelectedMonth = selectedDate.getMonth() === index;
              const isSelectedYear = selectedDate.getFullYear() === navigatedDate.getFullYear();
              const isInBounds = (minDate ? compareDatePart(minDate, getMonthEnd(indexedMonth)) < 1 : true) &&
                (maxDate ? compareDatePart(getMonthStart(indexedMonth), maxDate) < 1 : true);

              return <button
                role="gridcell"
                className={
                  css('ms-DatePicker-monthOption',
                    highlightCurrentMonth && isCurrentMonth! && 'ms-DatePicker-day--today ms-DatePicker-month--currentMonth',
                    (highlightCurrentMonth || highlightSelectedMonth) && isSelectedMonth && isSelectedYear && 'ms-DatePicker-day--highlighted ms-DatePicker-month--highlighted',
                    !isInBounds && 'ms-DatePicker-monthOption--disabled'
                  )
                }
                disabled={ !isInBounds }
                key={ index }
                onClick={ isInBounds ? this._selectMonthCallbacks[index] : undefined }
                onKeyDown={ isInBounds ? this._onSelectMonthKeyDown(index) : undefined }
                aria-label={ dateTimeFormatter.formatMonthYear(indexedMonth, strings) }
                aria-selected={ isCurrentMonth || isNavigatedMonth }
                data-is-focusable={ isInBounds ? true : undefined }
                ref={ isNavigatedMonth ? 'navigatedMonth' : undefined }
              >
                { month }
              </button>;
            }
            ) }
          </div>
        </FocusZone>
      </div>
    );
  }

  public focus() {
    if (this.refs.navigatedMonth) {
      this.refs.navigatedMonth.tabIndex = 0;
      this.refs.navigatedMonth.focus();
    }
  }

  private _isCurrentMonth(month: number, year: number, today: Date): boolean {
    return today.getFullYear() === year && today.getMonth() === month;
  }

  private _onKeyDown = (callback: () => void, ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      callback();
    }
  }

  private _onSelectNextYear = (): void => {
    const { navigatedDate, onNavigateDate } = this.props;
    onNavigateDate(addYears(navigatedDate, 1), false);
  }

  private _onSelectNextYearKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      this._onKeyDown(this._onSelectNextYear, ev);
    }
  }

  private _onSelectPrevYear = (): void => {
    const { navigatedDate, onNavigateDate } = this.props;
    onNavigateDate(addYears(navigatedDate, -1), false);
  }

  private _onSelectPrevYearKeyDown = (ev: React.KeyboardEvent<HTMLElement>): void => {
    if (ev.which === KeyCode.enter) {
      this._onKeyDown(this._onSelectPrevYear, ev);
    }
  }

  private _onSelectMonthKeyDown = (index: number): (ev: React.KeyboardEvent<HTMLElement>) => void => {
    return (ev: React.KeyboardEvent<HTMLElement>) => this._onKeyDown(() => this._onSelectMonth(index), ev);
  }

  private _onSelectMonth = (newMonth: number): void => {
    const { navigatedDate, onNavigateDate, onHeaderSelect } = this.props;

    // If header is clickable the calendars are overlayed, switch back to day picker when month is clicked
    if (onHeaderSelect) {
      onHeaderSelect(true);
    }
    onNavigateDate(setMonth(navigatedDate, newMonth), true);
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
}
