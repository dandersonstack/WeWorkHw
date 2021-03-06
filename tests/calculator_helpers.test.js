const Moment = require('moment');
const { calculateExpectedRevenue } = require('../scripts/calculator_helpers');

test('If it calculates for the full month', () => {
    let csv_data_in_json = [{ Capacity: '1', 'Monthly Price': '600', 'Start Day': '2013-01-01', 'End Day': '2015-08-02' }]
    let selected_month_dates = { selected_month_start_date: Moment("2014-01-01T00:00:00.000"),
                                selected_month_end_date: Moment("2014-01-31T23:59:59.999") };
    let calculatedValues = calculateExpectedRevenue(csv_data_in_json, selected_month_dates)
    expect(calculatedValues.expected_revenue).toBe(600)
});


test('If it calculates only the end of the month', () => {
    let csv_data_in_json = [{ Capacity: '1', 'Monthly Price': '600', 'Start Day': '2014-01-15', 'End Day': '2014-02-02' }]
    let selected_month_dates = { selected_month_start_date: Moment("2014-01-01T00:00:00.000"),
                                selected_month_end_date: Moment("2014-01-31T23:59:59.999") };
    let calculatedValues = calculateExpectedRevenue(csv_data_in_json, selected_month_dates)
    expect(calculatedValues.expected_revenue).toBe(310)
});

test('If it calculates only the beginning', () => {
    let csv_data_in_json = [{ Capacity: '1', 'Monthly Price': '600', 'Start Day': '2013-12-15', 'End Day': '2014-01-15' }]
    let selected_month_dates = { selected_month_start_date: Moment("2014-01-01T00:00:00.000"),
                                selected_month_end_date: Moment("2014-01-31T23:59:59.999") };
    let calculatedValues = calculateExpectedRevenue(csv_data_in_json, selected_month_dates);
    expect(calculatedValues.expected_revenue).toBe(271)
});

test('If it calculates a subset of the month', () => {
    let csv_data_in_json = [{ Capacity: '1', 'Monthly Price': '600', 'Start Day': '2014-01-13', 'End Day': '2014-01-15' }]
    let selected_month_dates = { selected_month_start_date: Moment("2014-01-01T00:00:00.000"),
                                selected_month_end_date: Moment("2014-01-31T23:59:59.999") };
    let calculatedValues = calculateExpectedRevenue(csv_data_in_json, selected_month_dates);
    expect(calculatedValues.expected_revenue).toBe(39)
});

test('If it should not calculate any of the month', () => {
    let csv_data_in_json = [{ Capacity: '1', 'Monthly Price': '600', 'Start Day': '2015-01-13', 'End Day': '2015-01-15' }]
    let selected_month_dates = { selected_month_start_date: Moment("2014-01-01T00:00:00.000"),
                                selected_month_end_date: Moment("2014-01-31T23:59:59.999") };
    let calculatedValues = calculateExpectedRevenue(csv_data_in_json, selected_month_dates);
    expect(calculatedValues.expected_revenue).toBe(0);
    expect(calculatedValues.unresolved_office_capacity).toBe(1)
});
