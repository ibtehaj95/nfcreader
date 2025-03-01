type NFCTagDataType =  {
    id: number;
    machine_name: string;
    manual_url: string;
    service_record: NFCTagServiceRecordType[];
};

type NFCTagsListType = NFCTagData[];

type NFCTagServiceRecordType = {
    id: number;
    service_date: string;
};