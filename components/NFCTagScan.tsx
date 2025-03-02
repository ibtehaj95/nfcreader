import { View, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { IconButton, TextInput, MD3DarkTheme, Portal, Text, Modal, Dialog, Card } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';

const NFCTagScan = ({ visible, hideModal, renderComponent, homePageRefresh }: { visible: boolean, hideModal: () => void, renderComponent: React.Dispatch<React.SetStateAction<boolean>>, homePageRefresh: React.Dispatch<React.SetStateAction<boolean>> }) => {

  const [ newMachineName, setNewMachineName ] = useState<string>('');
  const [ newMachineManualURL, setNewMachineManualURL ] = useState<string>('');
  const [ newMachineLastServiceDate, setNewMachineLastServiceDate ] = useState<string>('');
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ readingNFC, setReadingNFC ] = useState<boolean>(false);
  const [ nfcTagData, setNFCTagData ] = useState<string>('');

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  const storage = new MMKV();

  const readNFC = async () => {
    console.log("Reading NFC");
    setReadingNFC(true);

    let nfcDataLocal: string = '';

    try {
      // Pre-step, call this before any NFC operations
      NfcManager.start();
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      console.warn('Tag found', tag);
      if(tag !== null && tag.ndefMessage){
        const ndefData = tag.ndefMessage[0].payload;
        ndefData.forEach((byte: number) => {
          nfcDataLocal += String.fromCharCode(byte);
        });
        // console.log(nfcDataLocal);
      }
      setNFCTagData(nfcDataLocal);
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
    console.log("NFC Data: ", nfcTagData);
  }, [nfcTagData]);

  useEffect(() => {
    console.log("NFCTagScan mounted");
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
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style = { styles.headerText }>Scanning NFC</Text>
          </Card.Content>
        </Card>
        <View style={styles.buttonsContainer}>
          <IconButton
            icon="cancel" 
            mode='contained'
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Cancel`);
              // setNewMachineName('');
              // setNewMachineManualURL('');
              // setNewMachineLastServiceDate('');
            }}
          />
          <IconButton
            icon="database-plus" 
            mode='contained'
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Save to DB`);

              // if(newMachineName === '' || newMachineManualURL === '' || newMachineLastServiceDate === ''){
              //   showDialog();
              //   return;
              // }

              // // create a new NFC tag object
              // const newId = Date.now();
              // const newTaskItem:NFCTagDataType = { 
              //   id: newId, 
              //   machine_name: newMachineName, 
              //   manual_url: newMachineManualURL, 
              //   service_record: [{
              //     id: Date.now(),
              //     service_date: newMachineLastServiceDate
              //   }] 
              // };

              // // add just the new tag object to the list
              // storage.set(`${newId}`, JSON.stringify(newTaskItem));
              
              // // clear the input fields
              // setNewMachineName('');
              // setNewMachineManualURL('');
              // setNewMachineLastServiceDate('');

              // // close the modal
              // hideModal();

              // // refresh the home page
              // homePageRefresh(true);
            }}
          />
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Content>
              <Text variant="bodyMedium" style = { styles.dialogContainer }>Please enable NFC!</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </Modal>
    </Portal>
  )
};

const styles = StyleSheet.create({
  modalStyle: {
    // flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MD3DarkTheme.colors.surface,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  headerText: {
    marginTop: 8,
    marginBottom: 2,
    color: MD3DarkTheme.colors.onSurface,
  },
  inputContainer: {
    // flex: 0.4,
    width: '100%',
    flexDirection: 'column',
    paddingHorizontal: 6,
    // justifyContent: 'space-between',
    // alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  dialogContainer: {
    color: MD3DarkTheme.colors.onSurface,
  },
  card: {
    margin: 20,
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
  },
});

export default NFCTagScan;