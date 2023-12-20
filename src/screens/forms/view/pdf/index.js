import React, {Component} from 'react';
import {
  Alert,
  StyleSheet,
  StatusBar,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import {FAB} from 'react-native-paper';

import Header from '../../../../ui/header';
import Container from '../../../../ui/components/container';

import {primary} from '../../../../utilities/colors';

import Pdf from 'react-native-pdf';
import RNFetchBlob from 'rn-fetch-blob';
//import DropdownAlert from 'react-native-dropdownalert';

export default class FormPDF extends Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadProgress: 0,
      title: 'Form PDF',
      source: {
        uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf',
        cache: true,
      },
      dialogLoading: false,
      titleDialog: 'Downloading file ...',
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      title: 'Form PDF',
      source: {
        uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf',
        cache: true,
      },
      dialogLoading: false,
    });
  }

  download = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const {config, fs} = RNFetchBlob;
      let DownloadDir = fs.dirs.DownloadDir; // this is the Downloads directory.
      let options = {
        fileCache: true,
        //  appendExt : extension, //Adds Extension only during the download, optional
        addAndroidDownloads: {
          useDownloadManager: true, //uses the device's native download manager.
          notification: true,
          //  mime: 'text/plain',
          title: 'AEFI Form', // Title of download notification.
          path: `${DownloadDir}/` + this.state.title + '.pdf', // this is the path where your download file will be in
          description: 'Downloading file.',
        },
      };
      config(options)
        .fetch('GET', this.state.source.uri)
        .progress({interval: 200}, (received, total) => {
          console.log('progress', received / total);
          this.setState({
            downloadProgress: (received / total) * 100,
          });
        })
        .then((res) => {
          console.log(res);
          Alert.alert(
            'File Downloaded!',
            'The file ' +
              this.state.title +
              ' has been saved to the download folder.',
          );
        })
        .catch((err) => {
          console.log('error', err);
        }); // To execute when download  cancelled and other errors
    } else {
      Alert.alert(
        'Permission Denied!',
        'You need to give storage permission to download the file',
      );
    }
  };

  goBack = () => {
    this.props.navigation.navigate('FormList', {
      form_type: 'aefi',
    });
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Form PDF" goBack={this.goBack} />

        <Pdf
          source={this.state.source}
          onLoadComplete={(numberOfPages, filePath) => {
            //console.log(`number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            //console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            //console.log(error);
          }}
          onPressLink={(uri) => {
            //console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />

        <FAB
          style={styles.fab}
          icon="download"
          color={primary}
          onPress={() => this.download()}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
