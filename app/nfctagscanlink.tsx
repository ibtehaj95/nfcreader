import { View, StyleSheet, FlatList, StatusBar, StatusBarStyle, Linking, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from 'react';
import { MD3DarkTheme, Text, Card, Appbar, Button } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { router, useLocalSearchParams } from 'expo-router';

const NFCTagScanLink = () => {

  const [ tagID, setTagID ] = useState<IDType>("");
  const [ machineName, setMachineName ] = useState<MachineNameType>('');
  const [ machineManualURL, setMachineManualURL ] = useState<ManualURLType>('');
  const [ machineSericeRecord, setMachineServiceRecord ] = useState<NFCTagServiceRecordType[]>([]);
  const [ readingNFC, setReadingNFC ] = useState<boolean>(false);
  const [ nfcTagData, setNFCTagData ] = useState<string>('');
  const [ tagRead, setTagRead ] = useState<boolean>(false);
  const [ noNFCAvailable, setNoNFCAvailable ] = useState<boolean>(false);

  const [ statusBarStyle ] = useState<StatusBarStyle>("dark-content");

  const { caller } = useLocalSearchParams();

  const readNFC = async () => {

    console.log("Reading NFC");
    
    const NFCEnabled = await NfcManager.isEnabled(); // check if NFC is enabled
    const NFCSupported = await NfcManager.isSupported(); // check if device supports NFC

    if(NFCEnabled && NFCSupported){
      setNoNFCAvailable(false);
    }
    else{
      setNoNFCAvailable(true);
      return;
    }

    setReadingNFC(true);

    let nfcDataLocal: string = '';

    try {
      // Pre-step, call this before any NFC operations
      NfcManager.start();
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      // console.warn('Tag found', tag);

      if(tag !== null && tag.ndefMessage){
        const ndefData = tag.ndefMessage[0].payload;
        ndefData.forEach((byte: number) => {
          if(byte>32 && byte<127){
            nfcDataLocal += String.fromCharCode(byte);
          }
        });
        // console.log(nfcDataLocal);
      }
      setNFCTagData(nfcDataLocal);

      if(tag !== null && tag.id){
        // console.log("Tag ID: ", tag.id);
        setTagID(tag.id);
      }
    } 
    catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest(); // redundant
    }
  };

  useEffect(() => {
    return () => {
      if(readingNFC === true){
        console.log("Stopping NFC scan");
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }
  }, [readingNFC]);

  useEffect(() => {

    // console.log("NFC Data JSON: ", nfcTagData);
    const nfcTagDataLocal:string = nfcTagData.slice(2);

    let localMachineName: MachineNameType = '';
    let localMachineManualURL: ManualURLType = '';
    let localMachineServiceRecord = '';

    if(nfcTagDataLocal){
      try{

        const nfcDataObj = JSON.parse(nfcTagDataLocal);
        // console.log("NFC Data Object: ", nfcDataObj);

        setMachineName(nfcDataObj.name);
        localMachineName = nfcDataObj.name;
        setMachineManualURL(nfcDataObj.manual_url);
        localMachineManualURL = nfcDataObj.manual_url;
        // console.log("Service Record: ", nfcDataObj.service_record);
        
        let serviceRecord: NFCTagServiceRecordType[] = [];
        
        if(nfcDataObj.service_record.length > 0){
          nfcDataObj.service_record.forEach((serviceRecordElem: string) => {
            const serviceRecordItem: NFCTagServiceRecordType = {
              id: Math.floor(Math.random()*10000),
              service_date: serviceRecordElem,
            }
            serviceRecord.push(serviceRecordItem);
            localMachineServiceRecord += "d=" + serviceRecordElem;
          });
          setMachineServiceRecord(serviceRecord);
        }
        else{
          setMachineServiceRecord([]);
        }
      }
      catch(ex){
        console.log("Error parsing JSON: ", ex);
      }
      finally{
        setTagRead(true);
        setReadingNFC(false);
        console.log("Go to the page that called the deeplink");
        if(caller){
          // console.log(tagID, localMachineName, localMachineManualURL, localMachineServiceRecord);
          const cleanCaller = caller.toString().split('?')[0];
          const url = `${cleanCaller}?tagid=${tagID}&name=${localMachineName}&url=${localMachineManualURL}&srecord=${localMachineServiceRecord}`;
          // console.log("URL", url);
          if (Platform.OS === "android") {
            Linking.openURL(`googlechrome://navigate?url=${url}`);
          } else {
            Linking.openURL(url);
          }
          router.replace('/');
        }
      }
    }
  }, [nfcTagData]);

  useEffect(() => {
    console.log("NFCTagScan mounted", caller);
    readNFC();
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
            (noNFCAvailable === true?
              <Card style={styles.noNFC}>
              <Card.Content>
                <Text variant="titleMedium" style = { styles.headerText }>No NFC. Please enable, close app and try again</Text>
              </Card.Content>
            </Card>:  
            <Card style={styles.scanCard}>
              <Card.Content>
                <Text variant="titleMedium" style = { styles.headerText }>Scanning NFC ...</Text>
              </Card.Content>
            </Card>):
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
            icon="home"
            mode='contained'
            buttonColor={MD3DarkTheme.colors.onSurface}
            textColor={MD3DarkTheme.colors.surface}
            onPress={() => {
              console.log(`Going Home`);
              router.replace('/');
            }}
          >
            Go to Home
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

export default NFCTagScanLink;