import { View, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { IconButton, TextInput, MD3DarkTheme, Portal, Text, Modal, Dialog, Card } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';

const NFCTagScan = ({ visible, hideModal, renderComponent, homePageRefresh }: { visible: boolean, hideModal: () => void, renderComponent: React.Dispatch<React.SetStateAction<boolean>>, homePageRefresh: React.Dispatch<React.SetStateAction<boolean>> }) => {

  const [ tagID, setTagID ] = useState<IDType>("");
  const [ machineName, setMachineName ] = useState<MachineNameType>('');
  const [ machineManualURL, setMachineManualURL ] = useState<ManualURLType>('');
  const [ machineSericeRecord, setMachineServiceRecord ] = useState<NFCTagServiceRecordType[]>([]);
  const [ readingNFC, setReadingNFC ] = useState<boolean>(false);
  const [ nfcTagData, setNFCTagData ] = useState<string>('');
  const [ tagRead, setTagRead ] = useState<boolean>(false);
  const [ noNFCAvailable, setNoNFCAvailable ] = useState<boolean>(false);

  const storage = new MMKV();

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
      NfcManager.cancelTechnologyRequest();
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
    if(nfcTagDataLocal){
      try{

        const nfcDataObj = JSON.parse(nfcTagDataLocal);
        // console.log("NFC Data Object: ", nfcDataObj);

        setMachineName(nfcDataObj.name);
        setMachineManualURL(nfcDataObj.manual_url);
        // console.log("Service Record: ", nfcDataObj.service_record);
        
        let serviceRecord: NFCTagServiceRecordType[] = [];
        
        if(nfcDataObj.service_record.length > 0){
          nfcDataObj.service_record.forEach((serviceRecordElem: string) => {
            const serviceRecordItem: NFCTagServiceRecordType = {
              id: Math.floor(Math.random()*10000),
              service_date: serviceRecordElem,
            }
            serviceRecord.push(serviceRecordItem);
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
      }
    }
  }, [nfcTagData]);

  useEffect(() => {
    // console.log("NFCTagScan mounted");
    readNFC();
  }, []);
  
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          hideModal();
          renderComponent(false);
        }}
        contentContainerStyle={styles.modalStyle}>
          {tagRead === false ?
            (noNFCAvailable === true?
              <Card style={styles.noNFC}>
              <Card.Content>
                <Text variant="titleMedium" style = { styles.headerText }>No NFC. Please enable and tap icon on home screen again</Text>
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
          <IconButton
            icon="cancel" 
            mode='contained'
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Cancel`);
              hideModal();
              renderComponent(false);
            }}
          />
          <IconButton
            icon="database-plus" 
            mode='contained'
            disabled={!tagRead}
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Save to DB`);

              // create a new NFC tag object
              const newTagObj:NFCTagDataType = { 
                id: tagID,
                machine_name: machineName,
                manual_url: machineManualURL,
                service_record: machineSericeRecord,
              };

              // add just the new tag object to the list
              storage.set(`${tagID}`, JSON.stringify(newTagObj));

              // close the modal
              hideModal();

              // refresh the home page
              homePageRefresh(true);

              // dismount the component
              renderComponent(false);
            }}
          />
        </View>
      </Modal>
    </Portal>
  )
};

const styles = StyleSheet.create({
  modalStyle: {
    // flex: 0.6,
    maxHeight: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MD3DarkTheme.colors.surface,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  headerText: {
    color: MD3DarkTheme.colors.onSurface,
  },
  buttonsContainer: {
    flexDirection: 'row',
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

export default NFCTagScan;