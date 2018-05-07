const fs = require('file-system');
const {
    parseCSVFile,
    validateAndGenerateSelectedMoments,
    calculateExpectedRevenue,
    readToSTDOut} = require('./calculator_helpers');

class Calculator {
    constructor() {
        this.pathToFile = null;
        this.selected_month_string = null;
    }

    grabInputsFromArgs() {
        let args = process.argv.slice(2);
        if(args.length <= 1) {
            throw new Error('Missing Arguments, please provide an input file followed by a Year-Month object (YYYY-MM).')
        }
        this.pathToFile = args[0];
        this.selected_month_string = args[1];
    }

    basicValidateInputArguments() {
        this.validateFileExists();
        this.validateInputDate();
    }

    validateInputDate() {
        if(!this.selected_month_string.match(/^\d{4}-\d{2}$/g)) {
            throw new Error('The Year-Month object does follow the correct syntax (YYYY-MM).')
        }
    }

    validateFileExists() {
        if(!fs.existsSync(this.pathToFile)) {
            throw new Error('The file does not exist with the provided path.')
        }
    }

    async mainFunction() {
        try {
            this.grabInputsFromArgs();
            this.basicValidateInputArguments();
            let selected_month_values = validateAndGenerateSelectedMoments(this.selected_month_string);
            let parsedCSVFile = await (parseCSVFile(this.pathToFile));
            let calculatedValues = calculateExpectedRevenue(parsedCSVFile, selected_month_values);
            readToSTDOut(this.selected_month_string, calculatedValues.expected_revenue, calculatedValues.unresolved_office_capacity);
        } catch(error) {
            console.log(error);
        }

    }

}

let CalculateProfitsBot = new Calculator();
CalculateProfitsBot.mainFunction();
