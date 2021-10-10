import * as React from "react";
import * as ReactDOM from "react-dom";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { Page } from "azure-devops-ui/Page";
import { Filter } from "azure-devops-ui/Utilities/Filter";
import { FilterBar } from "azure-devops-ui/FilterBar";

import { DatePickerFilterBarItem } from "azure-devops-ui-datepicker";

import "azure-devops-ui/Core/override.css";

const scrollRef = React.createRef<HTMLDivElement>();
const filter = new Filter();

ReactDOM.render(
  <div className="full-size flex-column">
    <div className="flex-row flex-grow v-scroll-auto">
      <Surface background={SurfaceBackground.neutral}>
        <Page className="flex-grow custom-scrollbar scroll-auto-hide" scrollableContainerRef={scrollRef}>
          <FilterBar filter={filter}>
              <DatePickerFilterBarItem
                  filterItemKey="date"
                  filter={filter}
                  placeholder="Enter a Date"
              />
              <DatePickerFilterBarItem
                  filterItemKey="date2"
                  filter={filter}
                  placeholder="Enter a Date"
                  hasClearButton={true}
              />
          </FilterBar>
        </Page>
      </Surface>
    </div>
  </div>,
  document.getElementById('react-root')
);
