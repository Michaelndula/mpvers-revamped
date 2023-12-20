import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {moderateScale} from 'react-native-size-matters';
import {
  StatusBar,
  Dimensions,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Alert,
} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {BarChart, PieChart} from 'react-native-chart-kit';

import Header from '../../../ui/header';
import Container from '../../../ui/components/component';

import {BASE_URL} from '../../../services/network';
import {withNetwork} from '../../../services/network';
import {capitalizeFirstLetter} from '../../../utilities/validation';

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: '#ffffff',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  decimalPlaces: 0,
  useShadowColorFromDataset: false, // optional
  style: {
    marginLeft: 0,
  },
};

const chartConfigPie = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const screenWidth = Dimensions.get('window').width;

class ViewReport extends React.Component {
  constructor(props) {
    super(props);
    const {form, report} = this.props.route.params;

    this.state = {
      pie_data: [],
      bar_data: {labels: [], datasets: [{data: []}]},
      form: form,
      report: report,
      loading: true,
      showSnack: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {form, report} = nextProps.route.params;
    this.setState(
      {
        pie_data: [],
        bar_data: {labels: [], datasets: [{data: []}]},
        loading: true,
        form: form,
        report: report,
      },
      () => {
        this.loadReport();
      },
    );
  }

  componentDidMount() {
    this.loadReport();
  }

  redirect(route) {
    this.props.navigation.navigate(route);
  }

  loadReport = () => {
    withNetwork(() => {
      let url = `${BASE_URL}/reports/${this.state.form}_by_${this.state.report}.json`;
      let report = this.state.report;

      axios
        .get(url)
        .then((response) => {
          // handle success
          if (report === 'gender') {
            this.reportGender(response.data);
          } else if (report === 'age') {
            this.reportAge(response.data);
          } else if (report === 'month') {
            this.reportMonth(response.data);
          } else if (report === 'year') {
            this.reportYear(response.data);
          } else if (report === 'county') {
            this.reportCounty(response.data);
          }
        })
        .catch((error) => {
          // handle error
          if (error.response.status) {
            Alert.alert(
              'Info',
              `Sorry, there is no ${
                this.state.report
              } data for ${this.state.form.slice(0, -1).toUpperCase()}`,
            );
            this.goBack();
          }
        })
        .then(() => {
          this.setState({loading: false});
        });
    });
  };

  formatMessage = (message) => {
    message = message.replace(/\\n/g, '');
    message = message.replace(/&nbsp;/g, ' ');
    return message.replace(/<[^>]*>?/gm, '').trim();
  };

  reportYear = (yearArray) => {
    let barchart = {};
    let labels = [];
    let dataYear = [];

    yearArray.map((item) => {
      labels.push(item[0].year);
      dataYear.push(parseInt(item[0].cnt, 10));
    });
    Object.assign(barchart, {
      labels: labels,
      datasets: [
        {
          data: dataYear,
        },
      ],
    });

    this.setState({bar_data: barchart});
  };

  reportMonth = (monthArray) => {
    let barchart = {};
    let labels = [];
    let dataMonth = [];

    monthArray.map((item) => {
      labels.push(item[0].month);
      dataMonth.push(parseInt(item[0].cnt, 10));
    });
    Object.assign(barchart, {
      labels: labels,
      datasets: [
        {
          data: dataMonth,
        },
      ],
    });

    this.setState({bar_data: barchart});
  };

  reportCounty = (countyArray) => {
    let barchart = {};
    let labels = [];
    let dataCounty = [];
    countyArray.map((item, index) => {
      labels.push(
        item.County.county_name ? item.County.county_name : 'Unknown',
      );
      dataCounty.push(parseInt(item[0].cnt, 10));
    });

    Object.assign(barchart, {
      labels: labels,
      datasets: [
        {
          data: dataCounty,
        },
      ],
    });
    this.setState({bar_data: barchart});
  };

  reportAge = (ageArray) => {
    let piechart = [];
    for (var i = 0; i < ageArray.length; i++) {
      piechart.push({
        name: ageArray[i][0].ager,
        population: parseInt(ageArray[i][0].cnt, 10),
        color: this.getColorSet(i),
        legendFontColor: 'black',
        legendFontSize: 15,
      });
    }
    this.setState({pie_data: piechart});
  };

  reportGender = (genderArray) => {
    let piechart = [];
    genderArray.map((item, index) => {
      let form = this.state.form.slice(0, -1);

      piechart.push({
        name:
          item[capitalizeFirstLetter(form)].gender !== ''
            ? item[capitalizeFirstLetter(form)].gender
            : 'Unknown',
        population: parseInt(item[0].cnt, 10),
        color: this.getColorSet(index),
        legendFontColor: 'black',
        legendFontSize: 15,
      });
    });
    this.setState({pie_data: piechart});
  };

  getColorSet(index) {
    let colors = [
      '#800000',
      '#000080',
      '#008000',
      '#FF0000',
      '#008080',
      '#808080',
      '#FFA500',
      '#FFFF00',
      '#FF00FF',
      '#00FF00',
      '#0000FF',
      '#00FFFF',
      '#808000',
      '#800080',
    ];
    if (index <= colors.length) {
      return colors[index];
    } else {
      return this.getRandomColor();
    }
  }

  getRandomColor() {
    return (
      '#' +
      (
        '00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      ).slice(-6)
    );
  }

  goBack = () => {
    this.props.navigation.navigate('Reports');
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Report" goBack={this.goBack} />
        <Text style={styles.title}>
          {capitalizeFirstLetter(this.state.form) +
            ' by ' +
            capitalizeFirstLetter(this.state.report)}
        </Text>
        {this.state.loading && <ActivityIndicator style={styles.center} />}
        {!this.state.loading && (
          <ScrollView horizontal>
            {(this.state.report === 'month' ||
              this.state.report === 'county' ||
              this.state.report === 'year') && (
              <View>
                <BarChart
                  style={styles.barChart}
                  data={this.state.bar_data}
                  width={this.state.bar_data.labels.length * 100}
                  height={250}
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                />
                <Text style={styles.textInfo}>Scroll horizontally to view</Text>
              </View>
            )}

            {(this.state.report === 'gender' ||
              this.state.report === 'age') && (
              <PieChart
                style={styles.pieChart}
                data={this.state.pie_data}
                width={screenWidth}
                height={275}
                chartConfig={chartConfigPie}
                accessor={'population'}
                backgroundColor={'transparent'}
                paddingLeft={'20'}
              />
            )}
          </ScrollView>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  barChart: {
    marginVertical: moderateScale(15),
  },
  pieChart: {
    marginTop: '25%',
  },
  center: {
    alignSelf: 'center',
    marginTop: '25%',
  },
  textInfo: {
    fontStyle: 'italic',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(10),
  },
  title: {
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
    fontSize: moderateScale(16),
    marginTop: moderateScale(15),
    marginBottom: moderateScale(10),
  },
});

const mapStateToProps = (state) => ({
  authToken: state.currentUser.token,
});

export default connect(mapStateToProps)(ViewReport);
