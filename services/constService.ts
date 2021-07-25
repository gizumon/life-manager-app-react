import { IConfig, ICategory } from '../interfaces/index';

namespace CONST {
    // Category for display list
    export const payCategories: ICategory[] = [
        {
          id: 'none',
          name: '指定なし',
          type: 'pay',
          setting: [
            {
                memberId: '1',
                ratio: 1.0,
            },
            {
                memberId: '2',
                ratio: 1.0,
            },
          ],
        },
        {
          id: 'foods',
          name: '飲食費',
          type: 'pay',
          setting: [
            {
                memberId: '1',
                ratio: 1.0,
            },
            {
                memberId: '2',
                ratio: 1.0,
            },
          ],
        },
        {
          id: 'households',
          name: '日用品',
          type: 'pay',
          setting: [
            {
                memberId: '1',
                ratio: 1.0,
            },
            {
                memberId: '2',
                ratio: 1.0,
            },
          ],
        },
        {
          id: 'hobbies',
          name: '趣味',
          type: 'pay',
          setting: [
            {
                memberId: '1',
                ratio: 1.0,
            },
            {
                memberId: '2',
                ratio: 1.0,
            },
          ],
        },
        {
          id: 'furniture',
          name: '家具・家電',
          type: 'pay',
          setting: [
            {
                memberId: '1',
                ratio: 1.0,
            },
            {
                memberId: '2',
                ratio: 1.0,
            },
          ],
        },
    ];

    export const buyCategories: ICategory[] = [
      {
        id: 'none',
        name: '指定なし',
        type: 'tobuy',
      },
      {
        id: 'food',
        name: '食料品',
        type: 'tobuy',
      },
      {
        id: 'households',
        name: '日用品',
        type: 'tobuy',
      },
      // {
      //   id: 'furniture',
      //   name: '家具・家電',
      //   type: 'tobuy',
      // },
    ]

    export const configs: IConfig[] = [
      {
        type: 'pay',
        name: 'pay',
        icon: 'mdi-account-cash',
        description: 'お会計を追加してね',
        inputs: [
          {
            id: 'price',
            name: 'いくら',
            type: 'number',
            placeholder: 'ex) 2000',
            icon: 'mdi-cash-100',
            model: '',
            validates: [
              {
                type: 'isNotNull',
              },
              {
                type: 'isGT',
                args: [0],
              },
              {
                type: 'isLE',
                args: [1000000],
              },
            ],
            order: 3,
          },
          {
            id: 'payedFor',
            name: '誰の',
            type: 'multi-check',
            placeholder: '-- だれの --',
            icon: 'mdi-account-circle',
            model: [], // TODO: mounted default person
            validates: [
              {
                type: 'isNotNull',
              },
              {
                type: 'isIncludeAll',
                args: []
              }
            ],
            dataList: [], // members
            order: 4,
          },
          {
            id: 'payedCategory',
            name: 'どんな',
            type: 'select',
            placeholder: '-- カテゴリ --',
            icon: 'mdi-help-box',
            model: 'none',
            validates: [
              {
                type: 'isInclude',
                args: [],
              }
            ],
            dataList: CONST.payCategories,
            order: 5,
          },
          {
            id: 'memo',
            name: '何を',
            type: 'text',
            placeholder: 'ex) コンビニ',
            icon: 'mdi-tooltip-edit',
            model: '',
            validates: [],
            args: [],
            order: 2,
          },
          {
            id: 'payedBy',
            name: '誰が',
            type: 'select-btns',
            placeholder: '',
            icon: 'mdi-account-circle',
            model: '',
            validates: [
              {
                type: 'isNotNull',
              },
              {
                type: 'isInclude',
                args: [],
              }
            ],
            args: [],
            dataList: [], // members
            order: 1,
          },
        ],
      },
      {
        type: 'todo',
        name: 'todo',
        icon: 'mdi-calendar-check',
        description: 'ToDoを追加してね',
        inputs: [
          {
            id: 'task',
            name: 'タスク',
            type: 'text',
            placeholder: 'ex) ごみ捨て',
            icon: 'mdi-checkbox-marked',
            model: '',
            validates: [
              {
                type: 'isNotNull',
              },
              {
                type: 'isString',
              },
            ],
            args: [],
            order: 2,
          },
          {
            id: 'doDueDate',
            name: '期限',
            type: 'date',
            placeholder: '2021/XX/XX',
            icon: 'mdi-calendar-clock',
            model: '',
            validates: [
              {
                type: 'isDate',
              },
            ],
            args: [],
            order: 3,
          },
          {
            id: 'doBy',
            name: '担当',
            type: 'select-btns',
            placeholder: '',
            icon: 'mdi-account-circle',
            model: '',
            validates: [
              {
                type: 'isNotNull'
              }, {
                type: 'isInclude',
                args: []
              }
            ],
            args: [],
            dataList: [], // members
            order: 1,
          },
        ],
      },
      {
        type: 'tobuy',
        name: 'tobuy',
        icon: 'mdi-cart-plus',
        description: '買う物リストを追加してね',
        inputs: [
          {
            id: 'item',
            name: '買う物',
            type: 'text',
            placeholder: 'ex) しめじ',
            icon: 'mdi-checkbox-marked',
            model: '',
            validates: [
              {
                type: 'isNotNull',
              },
              {
                type: 'isString',
              },
            ],
            args: [],
            order: 2,
          },
          {
            id: 'buyCategory',
            name: 'カテゴリ',
            type: 'select',
            placeholder: '-- カテゴリ --',
            icon: 'mdi-help-box',
            model: 'none',
            validates: [],
            dataList: CONST.buyCategories, // categories
            order: 3,
          },
          {
            id: 'buyDueDate',
            name: '期限',
            type: 'date',
            placeholder: '2021/XX/XX',
            icon: 'mdi-calendar-clock',
            model: '', // today
            validates: [
              {
                type: 'isDate',
              },
            ],
            args: [],
            order: 4,
          },
          {
            id: 'buyBy',
            name: '担当',
            type: 'select-btns',
            placeholder: '',
            icon: 'mdi-account-circle',
            model: '',
            validates: [
              {
                type: 'isNotNull'
              },{
                type: 'isInclude',
                args: []
              }
            ],
            args: [],
            dataList: [], // members + all
            order: 1,
          },
        ]
      },
    ];

    // TODO: Need to protect 
    export const firebaseConfig = {
      apiKey: "AIzaSyABK5jEgFuu6rf6oG_1dhGcQKQxu0IzhQE",
      authDomain: "life-manager-app-303611.firebaseapp.com",
      databaseURL: "https://life-manager-app-303611-default-rtdb.firebaseio.com",
      projectId: "life-manager-app-303611",
      storageBucket: "life-manager-app-303611.appspot.com",
      messagingSenderId: "228392641348",
      appId: "1:228392641348:web:9291e5a9d7554f7e296d11",
      measurementId: "G-KC6X7VM4SE"
    };

}
  
export default CONST