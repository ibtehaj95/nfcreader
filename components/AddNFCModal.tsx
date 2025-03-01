import { View, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { IconButton, TextInput, MD3DarkTheme, Portal, Text, Modal, Dialog } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';

const AddNFCModal = ({ visible, hideModal, homePageRefresh }: { visible: boolean, hideModal: () => void, homePageRefresh: React.Dispatch<React.SetStateAction<boolean>> }) => {

  const [ newMachineName, setNewMachineName ] = useState<string>('');
  const [ newMachineManualURL, setNewMachineManualURL ] = useState<string>('');
  const [ newMachineLastServiceDate, setNewMachineLastServiceDate ] = useState<string>('');
  const [ dialogVisible, setDialogVisible ] = useState(false);

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  const storage = new MMKV();
  
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalStyle}>
        <Text variant="titleMedium" style = { styles.headerText } >Add a new machine</Text>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            dense={true}
            multiline={false}
            placeholder="New machine name"
            placeholderTextColor={MD3DarkTheme.colors.onSurfaceVariant}
            activeOutlineColor={MD3DarkTheme.colors.surface}
            outlineColor={MD3DarkTheme.colors.surface}
            outlineStyle={{borderRadius: 25}}
            cursorColor={MD3DarkTheme.colors.onSurface}
            textColor={MD3DarkTheme.colors.onSurface}
            style={styles.inputField}
            // value={newMachineName} // slows down the input
            onChangeText={(text) => setNewMachineName(text)}
          />
          <TextInput
            mode="outlined"
            dense={true}
            multiline={false}
            placeholder="New machine manual URL"
            placeholderTextColor={MD3DarkTheme.colors.onSurfaceVariant}
            activeOutlineColor={MD3DarkTheme.colors.surface}
            outlineColor={MD3DarkTheme.colors.surface}
            outlineStyle={{borderRadius: 25}}
            cursorColor={MD3DarkTheme.colors.onSurface}
            textColor={MD3DarkTheme.colors.onSurface}
            style={styles.inputField}
            // value={newMachineManualURL} // slows down the input
            onChangeText={(text) => setNewMachineManualURL(text)}
          />
          <TextInput
            mode="outlined"
            dense={true}
            multiline={false}
            placeholder="Last service date (dd.mm.yyyy)"
            placeholderTextColor={MD3DarkTheme.colors.onSurfaceVariant}
            activeOutlineColor={MD3DarkTheme.colors.surface}
            outlineColor={MD3DarkTheme.colors.surface}
            outlineStyle={{borderRadius: 25}}
            cursorColor={MD3DarkTheme.colors.onSurface}
            textColor={MD3DarkTheme.colors.onSurface}
            style={styles.inputField}
            // value={newMachineLastServiceDate} // slows down the input
            onChangeText={(text) => setNewMachineLastServiceDate(text)}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <IconButton
            icon="eraser" 
            mode='contained'
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Erase`);
              setNewMachineName('');
              setNewMachineManualURL('');
              setNewMachineLastServiceDate('');
            }}
          />
          <IconButton
            icon="plus" 
            mode='contained'
            iconColor={MD3DarkTheme.colors.surface}
            containerColor={MD3DarkTheme.colors.onSurface}
            size={25}
            onPress={() => {
              console.log(`Add`);

              if(newMachineName === '' || newMachineManualURL === '' || newMachineLastServiceDate === ''){
                showDialog();
                return;
              }

              // create a new NFC tag object
              const newId = Date.now();
              const newTaskItem:NFCTagDataType = { 
                id: newId, 
                machine_name: newMachineName, 
                manual_url: newMachineManualURL, 
                service_record: [{
                  id: Date.now(),
                  service_date: newMachineLastServiceDate
                }] 
              };

              // add just the new tag object to the list
              storage.set(`${newId}`, JSON.stringify(newTaskItem));
              
              // clear the input fields
              setNewMachineName('');
              setNewMachineManualURL('');
              setNewMachineLastServiceDate('');

              // close the modal
              hideModal();

              // refresh the home page
              homePageRefresh(true);
            }}
          />
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Content>
              <Text variant="bodyMedium" style = { styles.dialogContainer }>Please enter all details</Text>
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
});

export default AddNFCModal;