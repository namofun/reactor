import * as React from "react";
import { FilterBarItem, IFilterBarItemProps, IFilterBarItemState } from "azure-devops-ui/FilterBarItem";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IFilterItemState } from "azure-devops-ui/Utilities/Filter";

import "./DatePicker.css";
import { DatePicker } from "./DatePicker";

export interface IDatePickerFilterBarItemState extends IFilterBarItemState<Date> {}

export interface IDatePickerFilterBarItemProps extends IFilterBarItemProps {
    initialValue?: Date;
    hasClearButton?: boolean;
}

export class DatePickerFilterBarItem extends FilterBarItem<Date, IDatePickerFilterBarItemProps, IDatePickerFilterBarItemState> {
    private filterDate = new ObservableValue<Date | undefined>(undefined);

    constructor(props: IDatePickerFilterBarItemProps) {
        super(props);
        this.filterDate.value = props.initialValue;
    }

    public componentDidMount() {
        super.componentDidMount();
        if (this.props.filter) {
            const filterValue = this.props.filter?.getFilterItemState(this.props.filterItemKey);
            this.onFilterChanged(filterValue);
        }
    }

    protected onFilterChanged(state: IFilterItemState | null) {
        super.onFilterChanged(state);
        if (state && state.value) {
            this.filterDate.value = state.value;
        } else {
            this.filterDate.value = undefined;
        }
    }

    public onSelectionChanged = (date: Date) => {
        this.setFilterValue({ value: date });
        this.filterDate.value = date;
    }

    public focus() {
        return false;
    }

    public render() {
        return (
            <div className="bolt-date-picker-filterbar-item">
                <DatePicker
                    value={this.filterDate}
                    onChange={this.onSelectionChanged}
                    placeholder={this.props.placeholder}
                    hasClearButton={this.props.hasClearButton}
                />
            </div>
        );
    }
}
