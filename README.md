# Jira Grafana Simple JSON microservice
### Connect Grafana to Jira Cloud to retrieve metrics on your Jira issues.

The original intention for this project was to allow me to show a singlestat count of open issues for my team's Jira Service Desk.



## Requirements
This project only requires your Grafana instance to have the [SimpleJson plugin](https://grafana.com/plugins/grafana-simple-json-datasource/installation) installed.

## Installation

Run the Docker container (replace environment variables with your Jira Cloud credentials):
```bash
$ docker run -d -p 3000:3000 --name jira-grafana -e JIRA_HOST=jira_server.com -e JIRA_USER=srinivasraja54 -e JIRA_PASS=XXXX bluefrg/jira-grafana-json-datasource
```

Confirm running by visiting: http://localhost:3000

This Project tested with JIRA Server and Grafana on-prem. I suggest you create different set of filters and favourite them.
This App retrives the favourite filters list and show stats accordingly as you create panels in Grafana


### docker-compose.yml
The docker-compose is included as an example of how to test Grafana and  the Jira Grafana JSON Datasource integration. Not intended for production use.

## Setup
To add this as a data source in Grafana, go to Configuration -> Data Sources and click Add. For the Type choose SimpleJson. Enter the root URL for this project (e.g. http://localhost:3000).

When adding a panel to a dashboard, choose the newly created data source. Under the metrics tab, you will see your Jira filters as an option to plot on your panel.



