import { View, StyleSheet, FlatList, StatusBar, StatusBarStyle } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from 'react';
import { MD3DarkTheme, Text, Card, Appbar, Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';

const CallNFCWeb = () => {

  const [ tagID, setTagID ] = useState<IDType>("");
  const [ machineName, setMachineName ] = useState<MachineNameType>('');
  const [ machineManualURL, setMachineManualURL ] = useState<ManualURLType>('');
  const [ machineSericeRecord, setMachineServiceRecord ] = useState<NFCTagServiceRecordType[]>([]);
  const [ tagRead, setTagRead ] = useState<boolean>(false);

  const [ statusBarStyle ] = useState<StatusBarStyle>("dark-content");

  const { tagid, name, url, srecord } = useLocalSearchParams();

  useEffect(() => {
    console.log("NFCTagScan mounted", tagid, name, url, srecord);
    if(tagid && name && url && srecord){
      setTagID(tagid.toString());
      setMachineName(name.toString());
      setMachineManualURL(url.toString());
      srecord.toString().split('d=').forEach((serviceRecord: string) => {
        if(serviceRecord !== ''){
          setMachineServiceRecord((prevMachineServiceRecord) => [...prevMachineServiceRecord, {id: Math.floor(Math.random()*10000), service_date: serviceRecord}]);
        }
      });
      setTagRead(true);
    }
  }, []);
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle={statusBarStyle}
      />
      <Appbar.Header>
          <Appbar.Content title="Scan NFC Tag" titleStyle={styles.appBar} />
      </Appbar.Header>
          {tagRead === false ?
            <Card style={styles.noNFC}>
              <Card.Content>
                <Text variant="titleMedium" style = { styles.headerText }>Press Button to Call NFC</Text>
              </Card.Content>
            </Card>:
            <Card style={styles.dataDisplayCard}>
              <Card.Content>
                <View style={styles.tagID}>
                  <Text variant="titleMedium" style= {styles.tagAttribute}>Tag ID</Text>
                  <Text variant="titleMedium" style= {styles.tagValue}>{tagID}</Text>
                </View>
                <View style={styles.machineName}>
                  <Text variant="titleMedium" style= {styles.tagAttribute}>Machine Name</Text>
                  <Text variant="titleMedium" style= {styles.tagValue}>{machineName}</Text>
                </View>
                <View style={styles.machineName}>
                  <Text variant="titleMedium" style= {styles.tagAttribute}>Machine Manual URL</Text>
                  <Text variant="titleMedium" style= {styles.tagValue}>{machineManualURL}</Text>
                </View>
                <View style={styles.serviceRecord}>
                  <Text variant="titleMedium" style= {styles.tagAttribute}>Service Record</Text>
                    <View style={styles.serviceRecordList}>
                    <FlatList
                      data={machineSericeRecord}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({item}) => 
                        <View>
                          <Text variant="titleMedium" style= {styles.tagValue}>{item.service_date}</Text>
                        </View>
                      }
                    />
                    </View>
                </View>
              </Card.Content>
            </Card>
          }
        <View style={styles.buttonsContainer}>
          <Button
            icon="nfc-search-variant"
            mode='contained'
            buttonColor={MD3DarkTheme.colors.onSurface}
            textColor={MD3DarkTheme.colors.surface}
            onPress={() => {
              console.log("NFC Link Component");
              router.push({ pathname: `nfcreader://nfctagscanlink?caller=${window.location.href}` });
            }}
          >
            Call NFC Scanner
          </Button>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
};

const styles = StyleSheet.create({
  appBar: {
    textAlign: 'left',
  },
  background: {
    backgroundColor: MD3DarkTheme.colors.surface,
    flex: 1,
  },
  headerText: {
    color: MD3DarkTheme.colors.onSurface,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanCard: {
    margin: 20,
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
  },
  noNFC: {
    margin: 20,
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
  },
  dataDisplayCard: {
    marginVertical: 20,
    marginHorizontal: 20,
    // flex: 1,
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
  },
  tagID: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  machineName: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  machineURL: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  serviceRecord: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  serviceRecordList: {
    maxHeight: 100,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tagAttribute: {
    color: MD3DarkTheme.colors.onSurfaceVariant,
  },
  tagValue: {
    color: MD3DarkTheme.colors.onSurface,
  },
});

export default CallNFCWeb;