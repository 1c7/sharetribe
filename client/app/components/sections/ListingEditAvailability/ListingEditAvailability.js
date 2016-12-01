/* eslint-disable react/no-set-state, no-console */

import { Component } from 'react';
import r, { div, button } from 'r-dom';
import moment from 'moment';
import { isSameDay } from 'react-dates';
import ManageAvailability from '../../sections/ManageAvailability/ManageAvailability';
import * as cssVariables from '../../../assets/styles/variables';

const IS_OPEN_INITIALLY = true;
const OPEN_HASH = 'edit-availability';
const now = Date.now();
const day1 = moment(now + 24 * 60 * 60 * 1000);
const day2 = moment(now + 2 * 24 * 60 * 60 * 1000);

class ListingEditAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleMonth: moment().startOf('month'),
      blockedDays: [],
      reservedDays: [day1, day2],
      isOpen: IS_OPEN_INITIALLY,
      hasChanges: false,
    };
    this.handleHashChange = this.handleHashChange.bind(this);
  }
  componentDidMount() {
    window.location.hash = this.state.isOpen ? OPEN_HASH : '';
    window.addEventListener('hashchange', this.handleHashChange);
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }
  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    this.setState({ isOpen: hash === OPEN_HASH });
  }
  render() {
    console.debug('ListingEditAvailability.render()');

    const allow = (d) => {
      this.setState({
        blockedDays: this.state.blockedDays.filter((day) => !isSameDay(d, day)),
        hasChanges: true,
      });
    };

    const block = (d) => {
      this.setState({
        blockedDays: this.state.blockedDays.concat(d),
        hasChanges: true,
      });
    };

    return r(ManageAvailability, {
      openWinderLinkHash: OPEN_HASH,
      hasChanges: this.state.hasChanges,
      onSave: () => {
        console.log('Saving availability changes');
        this.setState({ hasChanges: false });
        window.location.hash = '';
      },
      winder: {
        wrapper: document.querySelector('#sidewinder-wrapper'),
        isOpen: this.state.isOpen,
        width: cssVariables['--ManageAvailability_width'],
        onClose: () => {
          if (!this.state.hasChanges) {
            console.log('No availability changes to save');
            window.location.hash = '';
          } else if (confirm('You have unsaved changes, close anyways?')) {
            this.setState({ hasChanges: false });
            window.location.hash = '';
            console.log('Closing with availability changes');
          } else {
            console.log('Continue editing availability changes');
          }
        },
      },
      header: {
        backgroundColor: '347F9D',
        imageUrl: 'https://placehold.it/1024x1024',
        title: `Pelago San Sebastian, in very good condition in Kallio${this.state.hasChanges ? '*' : ''}`,
        height: cssVariables['--ManageAvailabilityHeader_height'],
      },
      calendar: {
        initialMonth: this.state.visibleMonth,
        blockedDays: this.state.blockedDays,
        reservedDays: this.state.reservedDays,
        onDayAllowed: allow,
        onDayBlocked: block,
        onMonthChanged: (m) => {
          this.setState({ visibleMonth: m });
        },
      },
    })
  }
}

export default ListingEditAvailability;
