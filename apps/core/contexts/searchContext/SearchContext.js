// @flow

import * as React from 'react';
import { withContext, noop } from '@kiwicom/margarita-utils';
import {
  type TripTypes,
  TRIP_TYPES,
  SEARCH_RESULTS_LIMIT,
  DEFAULT_SEARCH_SORTING,
  DEFAULT_NIGHTS_IN_DESTINATION_FROM,
  DEFAULT_NIGHTS_IN_DESTINATION_TO,
} from '@kiwicom/margarita-config';
import * as DateFNS from 'date-fns';
import qs from 'qs';

type Props = {|
  +children: React.Node,
  +routerQuery?: ParseFieldsParams,
|};

type ParseFieldsParams = {|
  +dateFrom?: ?string,
  +dateTo?: ?string,
  +returnDateFrom?: ?string,
  +returnDateTo?: ?string,
  +nightsInDestinationFrom?: number,
  +nightsInDestinationTo?: number,
  +adults?: ?string,
  +infants?: ?string,
  +travelFrom?: ?string,
  +travelTo?: ?string,
  +bookingToken: ?string,
|};

type ParseFieldsReturn = {|
  +dateFrom?: Date,
  +dateTo?: Date,
  +returnDateFrom?: Date,
  +returnDateTo?: Date,
  +nightsInDestinationFrom?: number,
  +nightsInDestinationTo?: number,
  +adults?: number,
  +infants?: number,
  +bookingToken: ?string,
|};

export type PassengersData = {|
  adults: number,
  infants: number,
|};

export type Location = {|
  +id: ?string | number,
  +locationId: ?string,
  +name: ?string,
  +type: ?string,
|};

export type LocationSearchType = 'travelTo' | 'travelFrom';
export type SortTypes = 'QUALITY' | 'PRICE' | 'DURATION';
type StateParams = {|
  travelFrom: $ReadOnlyArray<Location>,
  travelTo: $ReadOnlyArray<Location>,
  isNightsInDestinationSelected: boolean,
  nightsInDestinationFrom: number,
  nightsInDestinationTo: number,
  dateFrom: Date,
  sortBy: SortTypes,
  limit: number,
  dateTo: Date,
  returnDateFrom: Date,
  returnDateTo: Date,
  bookingToken: ?string,
  ...PassengersData,
|};

type State = {|
  tripType: TripTypes,
  ...StateParams,
  +actions: {
    +switchFromTo: () => void,
    +setDepartureDate: (Date, Date) => void,
    +setReturnDate: (Date, Date) => void,
    +setNightsInDestinationSelection: boolean => void,
    +setNightsInDestination: (number, number) => void,
    +setTripType: TripTypes => void,
    +setSortBy: SortTypes => void,
    +setPassengerData: ($ReadOnly<PassengersData>) => void,
    +clearLocation: LocationSearchType => void,
    +addLocation: (type: LocationSearchType, location: Location) => void,
    +setLocation: (type: LocationSearchType, location: Location) => void,
    +setBookingToken: string => void,
  },
|};

const defaultDepartureDate = DateFNS.addDays(new Date(), 1);
const defaultReturnDate = DateFNS.addDays(defaultDepartureDate, 2);

// TODO Temporary values for better development experiences, It should be replaced with nearest place suggestion.
const defaultPlaces = {
  origin: [
    {
      id: 'TG9jYXRpb246cHJhZ3VlX2N6',
      locationId: 'prague_cz',
      name: 'Prague',
      type: 'destination',
    },
  ],
  departure: [
    {
      id: 'TG9jYXRpb246b3Nsb19ubw==',
      locationId: 'oslo_no',
      name: 'Oslo',
      type: 'destination',
    },
  ],
};

const defaultState = {
  tripType: TRIP_TYPES.RETURN,
  travelFrom: defaultPlaces.origin,
  travelTo: defaultPlaces.departure,
  isNightsInDestinationSelected: false,
  nightsInDestinationFrom: DEFAULT_NIGHTS_IN_DESTINATION_FROM,
  nightsInDestinationTo: DEFAULT_NIGHTS_IN_DESTINATION_TO,
  dateFrom: defaultDepartureDate,
  dateTo: defaultDepartureDate,
  sortBy: DEFAULT_SEARCH_SORTING,
  limit: SEARCH_RESULTS_LIMIT,
  returnDateFrom: defaultReturnDate,
  returnDateTo: defaultReturnDate,
  bookingToken: null,
  adults: 1,
  infants: 0,
  actions: {
    setDepartureDate: noop,
    switchFromTo: noop,
    setReturnDate: noop,
    setNightsInDestinationSelection: noop,
    setNightsInDestination: noop,
    setTripType: noop,
    setSortBy: noop,
    setPassengerData: noop,
    setLocation: noop,
    clearLocation: noop,
    addLocation: noop,
    setBookingToken: noop,
  },
};

const { Provider, Consumer } = React.createContext<State>(defaultState);

const parseDate = (date: ?string, key: string) => {
  return date ? { [key]: new Date(date) } : {};
};

const parseNumber = (value: ?string, key: string) => {
  return value ? { [key]: parseInt(value, 10) } : {};
};

export default class SearchContextProvider extends React.Component<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props);

    const { routerQuery } = props;

    this.state = {
      ...defaultState,
      ...(routerQuery && this.parseFields(routerQuery)), // hydrate state from URL for the web
      actions: {
        switchFromTo: this.switchFromTo,
        setDepartureDate: this.setDepartureDate,
        setReturnDate: this.setReturnDate,
        setNightsInDestinationSelection: this.setNightsInDestinationSelection,
        setNightsInDestination: this.setNightsInDestination,
        setTripType: this.setTripType,
        setSortBy: this.setSortBy,
        setPassengerData: this.setPassengerData,
        clearLocation: this.clearLocation,
        addLocation: this.addLocation,
        setLocation: this.setLocation,
        setBookingToken: this.setBookingToken,
      },
    };
  }

  setBookingToken = (bookingToken: string) => {
    this.setState({ bookingToken });
  };

  // @TODO moved to SerchContext helpers and write tests
  parseFields = (params: ParseFieldsParams): ParseFieldsReturn => {
    return {
      ...parseDate(params.dateFrom, 'dateFrom'),
      ...parseDate(params.dateTo, 'dateTo'),
      ...parseDate(params.returnDateFrom, 'returnDateFrom'),
      ...parseDate(params.returnDateTo, 'returnDateTo'),
      ...parseNumber(params.adults, 'adults'),
      ...parseNumber(params.infants, 'infants'),
      ...(params.nightsInDestinationFrom
        ? { nightsInDestinationFrom: params.nightsInDestinationFrom }
        : {}),
      ...(params.nightsInDestinationTo
        ? { nightsInDestinationTo: params.nightsInDestinationTo }
        : {}),
      ...(params.bookingToken ? { bookingToken: params.bookingToken } : {}),
    };
  };

  switchFromTo = () => {
    this.setState(state => {
      const from = state.travelFrom;
      const to = state.travelTo;
      return {
        travelFrom: to,
        travelTo: from,
      };
    });
  };

  // @TODO moved to SerchContext helpers and write tests
  parseLocationParam = (param: ?string): $ReadOnlyArray<Location> | null => {
    if (param == null) {
      return null;
    }
    const asObject: {| [key: string]: Location |} = qs.parse(param);
    const asLocationArray: $ReadOnlyArray<Location> = Object.keys(asObject).map(
      key => asObject[key],
    );
    return asLocationArray;
  };

  setDepartureDate = (dateFrom: Date, dateTo: Date) => {
    this.setState(prevState => {
      return {
        dateFrom: dateFrom,
        dateTo: dateTo,
        returnDateFrom: DateFNS.max([prevState.returnDateFrom, dateTo]),
        returnDateTo: DateFNS.max([prevState.returnDateTo, dateTo]),
      };
    });
  };

  clearLocation = (locationType: LocationSearchType) => {
    this.setState({ [locationType]: [] });
  };

  addLocation = (locationType: LocationSearchType, location: Location) => {
    this.setState(({ [locationType]: selectedLocations }) => ({
      [locationType]: [...selectedLocations, location],
    }));
  };

  setLocation = (
    locationType: LocationSearchType,
    location: Location | Location[],
  ) => {
    this.setState({
      [locationType]: Array.isArray(location) ? location : [location],
    });
  };

  setReturnDate = (returnDateFrom: Date, returnDateTo: Date) => {
    this.setState(prevState => {
      const departureDateFrom = DateFNS.min([
        prevState.dateFrom,
        returnDateFrom,
      ]);
      const departureDateTo = DateFNS.min([prevState.dateTo, returnDateFrom]);
      return {
        dateFrom: departureDateFrom,
        dateTo: departureDateTo,
        returnDateFrom: returnDateFrom,
        returnDateTo: returnDateTo,
      };
    });
  };

  setNightsInDestinationSelection = (
    isNightsInDestinationSelected: boolean,
  ) => {
    this.setState({
      isNightsInDestinationSelected,
    });
  };

  setNightsInDestination = (
    nightsInDestinationFrom: number,
    nightsInDestinationTo: number,
  ) => {
    this.setState({
      nightsInDestinationFrom: nightsInDestinationFrom,
      nightsInDestinationTo: nightsInDestinationTo,
    });
  };

  setTripType = (tripType: TripTypes) => {
    this.setState({ tripType });
  };

  setSortBy = (sortBy: SortTypes) => {
    this.setState({ sortBy });
  };

  setPassengerData = (passengerData: $ReadOnly<PassengersData>) => {
    this.setState(passengerData);
  };

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

export const withSearchContext = (select: State => Object) =>
  withContext<State>(select, Consumer);

export type SearchContextState = State;
