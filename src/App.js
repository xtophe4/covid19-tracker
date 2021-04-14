import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import "./App.css";
import InfoBox from "./components/InfoBox";
import LineGraph from "./components/LineGraph";
import Map from "./components/Map";
import Table from "./components/Table";
import { prettyPrintStat, sortData } from "./services/util";

import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState([34.80756, -40.4796]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  //On page Load, Fetch All countries for select id countries
  useEffect(() => {
    const fetchAllCountries = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          setCountries(countries);

          //Sorted the data by cases
          const sortedData = sortData(data);
          setTableData(sortedData);
          //List map countries for Circle
          setMapCountries(data);
        });
    };

    fetchAllCountries();
  }, []);

  //On load get list of all countries used in select for worldwide value
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  //On select change, country code for select id countries
  const onCountryChange = ({ target }) => {
    const countryCode = target.value;

    //Fetch information from select
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    const fetchCountriesFromSelect = async () => {
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setCountryCode(countryCode);
          setCountryInfo(data);

          //setMap on change
          if (countryCode === "worldwide") {
            setMapCenter([34.80756, -40.4796]);
            setMapZoom(3);
          } else {
            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
            setMapZoom(3);
          }
        });
    };

    return fetchCountriesFromSelect();
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid 19 Tracker</h1>

          <FormControl className="app__dropdown">
            <Select
              onChange={onCountryChange}
              labelId="countries"
              id="countries"
              value={countryCode}
            >
              <MenuItem key="default" value="worldwide">
                Worldwide
              </MenuItem>
              {countries.map((country, index) => (
                <MenuItem key={index} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isOrange
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new Cases</h3>
            <LineGraph />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
