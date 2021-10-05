import * as React from "react";
import { css, getSafeId } from "azure-devops-ui/Util";

import {
  FormItem as FormItemV1,
  IFormItemContext,
  IFormItemProps as IFormItemV1Props,
  FormItemContext
} from "azure-devops-ui/FormItem";

import "./FormItem.css";

export { FormItemContext };
export type { IFormItemContext };

export interface IFormItemProps extends IFormItemV1Props {
  required?: boolean;
  alternativeRequired?: boolean;
}

export class FormItem extends React.Component<IFormItemProps> {

  public render() {
    return (
      <FormItemV1
          className={css(this.props.className, "bolt-formitem")}
          error={this.props.error}
          message={this.props.message}
      >
        {this.props.label && (
          <FormItemContext.Consumer>
            {value => (
              <label
                  aria-label={this.props.ariaLabel}
                  className={css(
                      "bolt-formitem-label",
                      "body-m",
                      this.props.required && "bolt-required",
                      this.props.alternativeRequired && "bolt-alternative-required"
                  )}
                  id={getSafeId(value.ariaLabelledById)}
              >
                {this.props.label}
              </label>
            )}
          </FormItemContext.Consumer>
        )}
        {this.props.children}
      </FormItemV1>
    );
  }
}
