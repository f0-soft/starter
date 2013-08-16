'use strict';

module.exports = {
    name: 'viewCustomers',
    template: 'viewCustomers.tpl',
    config: {
            sDom: "<'row'<'span6'l><'span6'<'#buttonFind'>>r>t<'row'<'span6'i><'span6'p>>",
            sPaginationType: 'bootstrap',
            bProcessing: true,
            bServerSide: false,
            test: {test_join:0, test_join2:0},
            aLengthMenu: [10, 20],
            aoColumns: [
                { _vid: '1', _flexo: {type: 'read', scheme: ['contacts', 'fio']}, mData: "fio", sTitle: "ФИО", sType: "string"},
                { _vid: '2', _flexo: {type: 'read', scheme:['contacts', 'position']}, mData: "position", sTitle: "Позиция", sType: "string"},
                { _vid: '3', _flexo: {type: 'read', scheme:['contacts', 'customers_name']},  mData: "customers_name", sTitle: "Компания", sType: "string", bSearchable: false},
                { _vid: '4', _flexo: {type: 'read', scheme: ['contacts', 'tsUpdate']}, mData: "tsUpdate", sTitle: "Дата изменения", sType: "date", dateSearch: "01-01-2010"}
            ]
    }
};
