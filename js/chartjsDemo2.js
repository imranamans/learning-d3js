function makeDemo() {

    // let dataset1 = JSON.parse('{"response": [{"id":1,"dateMeasured":"2021-08-11T12:33:04-0500","dateRecorded":"2021-08-11T12:33:24-0500","employee":{"id":36},"patient":{"id":324},"voidDate":"2021-08-12T09:48:43-0500","voidingEmployee":{"id":74},"creationDate":"2021-08-11T12:33:25-0500","value":132,"source":"Stated","fasting":"nonfasting"},{"id":2,"dateMeasured":"2021-08-11T13:28:53-0500","dateRecorded":"2021-08-11T13:29:16-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-11T13:29:17-0500","value":118,"source":"Stated","fasting":"nonfasting"},{"id":3,"dateMeasured":"2021-08-12T12:38:29-0500","dateRecorded":"2021-08-12T12:38:47-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T12:38:47-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":4,"dateMeasured":"2021-08-12T13:10:17-0500","dateRecorded":"2021-08-12T13:10:44-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T13:10:45-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":5,"dateMeasured":"2021-08-12T14:06:33-0500","dateRecorded":"2021-08-12T14:07:05-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T14:07:06-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":6,"dateMeasured":"2021-08-12T15:57:46-0500","dateRecorded":"2021-08-12T15:58:06-0500","employee":{"id":36},"patient":{"id":354},"creationDate":"2021-08-12T15:58:07-0500","value":114,"source":"Stated","fasting":"nonfasting"},{"id":7,"dateMeasured":"2021-08-12T16:43:12-0500","dateRecorded":"2021-08-12T16:43:33-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-12T16:43:34-0500","value":113,"source":"Stated","fasting":"nonfasting"},{"id":8,"dateMeasured":"2021-08-16T10:29:34-0500","dateRecorded":"2021-08-16T10:31:28-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-16T10:31:28-0500","value":122,"source":"Actual","fasting":"fasting","location":"Left middle"},{"id":9,"dateMeasured":"2021-08-16T10:31:09-0500","dateRecorded":"2021-08-16T10:31:32-0500","employee":{"id":36},"patient":{"id":365},"creationDate":"2021-08-16T10:31:33-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":10,"dateMeasured":"2021-08-16T10:36:29-0500","dateRecorded":"2021-08-16T10:36:29-0500","employee":{"id":74},"patient":{"id":324},"creationDate":"2021-08-16T10:36:30-0500","value":111,"source":"stated","fasting":"fasting","location":"Left"},{"id":11,"dateMeasured":"2021-08-16T10:41:40-0500","dateRecorded":"2021-08-16T10:41:40-0500","employee":{"id":23},"patient":{"id":400},"creationDate":"2021-08-16T10:41:41-0500","value":33,"source":"stated","fasting":"fasting","location":"Pinky"},{"id":12,"dateMeasured":"2021-08-12T14:17:00-0500","dateRecorded":"2021-08-16T14:18:23-0500","employee":{"id":36},"patient":{"id":419},"creationDate":"2021-08-16T14:18:23-0500","value":234,"source":"Stated","fasting":"nonfasting","location":"Left middle"},{"id":13,"dateMeasured":"2021-08-16T15:44:57-0500","dateRecorded":"2021-08-16T15:45:20-0500","employee":{"id":74},"patient":{"id":201},"creationDate":"2021-08-16T15:50:37-0500","value":134,"source":"Stated","fasting":"nonfasting"},{"id":14,"dateMeasured":"2021-08-16T16:54:24-0500","dateRecorded":"2021-08-16T16:54:46-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-16T16:54:47-0500","value":172,"source":"Stated","fasting":"nonfasting"},{"id":15,"dateMeasured":"2021-08-17T10:58:38-0500","dateRecorded":"2021-08-17T10:59:02-0500","employee":{"id":36},"patient":{"id":383},"creationDate":"2021-08-17T10:59:03-0500","value":132,"source":"Stated","fasting":"nonfasting"},{"id":16,"dateMeasured":"2021-08-17T11:08:50-0500","dateRecorded":"2021-08-17T11:08:53-0500","employee":{"id":36},"patient":{"id":417},"creationDate":"2021-08-17T11:08:54-0500","value":117,"source":"Stated","fasting":"nonfasting"},{"id":17,"dateMeasured":"2021-08-17T11:41:24-0500","dateRecorded":"2021-08-17T11:41:53-0500","employee":{"id":36},"patient":{"id":419},"creationDate":"2021-08-17T11:41:54-0500","value":123,"source":"Stated","fasting":"nonfasting"},{"id":18,"dateMeasured":"2021-08-17T12:59:15-0500","dateRecorded":"2021-08-17T12:59:44-0500","employee":{"id":36},"patient":{"id":382},"creationDate":"2021-08-17T12:59:45-0500","value":135,"source":"Stated","fasting":"nonfasting"},{"id":19,"dateMeasured":"2021-08-17T15:15:06-0500","dateRecorded":"2021-08-17T15:15:24-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-17T15:15:25-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":20,"dateMeasured":"2021-08-17T15:32:59-0500","dateRecorded":"2021-08-17T15:34:04-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-08-17T15:34:05-0500","value":100,"source":"Actual","fasting":"twoHrPP","location":"Left ring"},{"id":21,"dateMeasured":"2021-09-15T13:54:43-0500","dateRecorded":"2021-09-15T13:55:10-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-09-15T13:55:10-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":22,"dateMeasured":"2021-09-17T09:34:59-0500","dateRecorded":"2021-09-17T09:35:22-0500","employee":{"id":36},"patient":{"id":149},"creationDate":"2021-09-17T09:35:23-0500","value":97,"source":"Stated","fasting":"nonfasting"},{"id":23,"dateMeasured":"2021-09-17T11:59:48-0500","dateRecorded":"2021-09-17T12:00:06-0500","employee":{"id":36},"patient":{"id":324},"creationDate":"2021-09-17T12:00:07-0500","value":111,"source":"Stated","fasting":"nonfasting"},{"id":24,"dateMeasured":"2021-09-21T11:10:37-0500","dateRecorded":"2021-09-21T11:10:41-0500","employee":{"id":36},"patient":{"id":435},"creationDate":"2021-09-21T11:10:42-0500","value":123,"source":"Stated","fasting":"nonfasting"}]}').response;

    let dataset1 = {
        response: [
            {
                "patient_id" : 80513,
                "value" : 187,
                "date_measured" : "2021-03-21 13:53:12.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 247,
                "date_measured" : "2021-03-21 21:50:53.0",
                "fasting" : "nonfasting"
            },
            {
                "patient_id" : 80513,
                "value" : 113,
                "date_measured" : "2021-03-22 14:30:02.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 150,
                "date_measured" : "2021-03-23 13:38:11.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 155,
                "date_measured" : "2021-03-24 13:19:56.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 218,
                "date_measured" : "2021-03-25 14:50:27.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 126,
                "date_measured" : "2021-03-26 18:16:40.0",
                "fasting" : "fasting"
            },
            {
                "patient_id" : 80513,
                "value" : 97,
                "date_measured" : "2021-03-27 13:57:45.0",
                "fasting" : "fasting"
            }
        ]}.response;
        
    const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
    ];
    
    const data = {
        // labels: labels,
        datasets: [{
            label: 'Glucose',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: dataset1,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            parsing: {
                xAxisKey: 'date_measured',
                yAxisKey: 'value'
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }
            }
        }
    }; 
    
    var myChart = new Chart(
        document.getElementById('myChart'),
        config
      );
}