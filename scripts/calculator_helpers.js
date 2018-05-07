const csv = require('csvtojson');
const moment = require('moment');

const parseCSVFile = async function(path_to_data_file) {
    return (await new Promise((resolve, reject) => {
      const promises = [];
      csv()
        .fromFile(path_to_data_file)
        .on('json', converted => promises.push(Promise.resolve(converted)))
        .on('done', error => {
          if (error) {
            reject(error);
            return
          }
        Promise.all(promises).then(convertedResults => resolve(convertedResults))
      })
    }).then((parsedCSVFile)=>{
        return parsedCSVFile;
    }).catch((err)=>{
        throw new Error('There was an error parsing the csv file.')
    }) )
};

const validateAndGenerateSelectedMoments = function(selected_month_string) {
        if(!selected_month_string.match(/^\d{4}-\d{2}$/g)) {
            throw new Error('The Year-Month object does follow the correct syntax (YYYY-MM).')
        }
        let selected_month_moment = moment(selected_month_string + '-01');
        if(!selected_month_moment.isValid()) {
            throw new Error('The Year-Month object you provide is invalid.')
        }
        return {selected_month_start_date: selected_month_moment,
                selected_month_end_date: moment(selected_month_moment).endOf('months')}
};

const calculateExpectedRevenue = function (csv_data_in_json, selected_month_dates) {

    let expected_revenue = 0;
    let unresolved_office_capacity = 0;
    // expected reservation: { Capacity: '14', 'Monthly Price': '11875', 'Start Day': '2014-06-01', 'End Day': '' },
    csv_data_in_json.forEach((reservation)=>{
        let rental_start_date = moment(reservation['Start Day']);
        let rental_end_date = reservation['End Day'] === ''? moment() : moment(reservation['End Day']);
        let selected_month_start_date = selected_month_dates.selected_month_start_date;
        let selected_month_end_date = selected_month_dates.selected_month_end_date;

        if(rental_start_date.isAfter(selected_month_end_date) ||
            rental_end_date.isBefore(selected_month_start_date)) {
            unresolved_office_capacity += Number.parseInt(reservation.Capacity);
        } else if (rental_start_date.isBefore(selected_month_start_date) &&
                    rental_end_date.isAfter(selected_month_end_date)) {
            expected_revenue += Number.parseInt(reservation['Monthly Price'])
        } else {
           expected_revenue += calculateProRate(
               reservation['Monthly Price'],
               rental_start_date,
               rental_end_date,
               selected_month_end_date,
               selected_month_start_date)
        }
    });
    return {expected_revenue: expected_revenue, unresolved_office_capacity: unresolved_office_capacity}
};

const calculateProRate = function (monthly_price, rental_start_date, rental_end_date, selected_month_end_date, selected_month_start_date) {
    let days_in_month = rental_start_date.daysInMonth();
    if(selected_month_start_date.isBefore(rental_start_date)
       && selected_month_end_date.isAfter(rental_end_date)) {
        return Math.ceil((rental_end_date.diff(rental_start_date, 'days') / days_in_month ) * monthly_price)
    } else if( selected_month_start_date.isAfter(rental_start_date) ) { //only the calculate the end of the month
        console.log('it should calculate the beginning');
        return Math.ceil((rental_end_date.diff(selected_month_start_date, 'days') / days_in_month ) * monthly_price)
    } else { //only calculate the beginning of the month
        console.log('the months are between');
        return Math.ceil((selected_month_end_date.diff(rental_start_date, 'days')  / days_in_month ) * monthly_price)
    }
};

const readToSTDOut = function (month_string, expected_revenue, unresolved_capacity) {
    console.log(`${month_string}: expected revenue: $${expected_revenue}, expected total capacity of the unreserved offices: ${unresolved_capacity}`)
};


module.exports = {
    parseCSVFile,
    validateAndGenerateSelectedMoments,
    calculateExpectedRevenue,
    readToSTDOut
};