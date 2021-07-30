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
        {
          id: 'fixed-cost',
          name: '固定費',
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
        name: 'その他',
        type: 'tobuy',
        isHide: false,
      },
      {
        id: 'super',
        name: 'スーパー',
        type: 'tobuy',
        isHide: false,
      },
      {
        id: 'oneDollarShop',
        name: '100円均一',
        type: 'tobuy',
        isHide: false,
      },
      {
        id: 'drugstore',
        name: '薬局',
        type: 'tobuy',
        isHide: false,
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
          },
          {
            id: 'doDueDate',
            name: 'いつまで',
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
            isHideInput: false,
            isHideList: false,
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
            isHideInput: false,
            isHideList: false,
          },
          {
            id: 'doneDate',
            name: '完了日',
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
            dataList: [],
            order: 4,
            isHideInput: true,
            isHideList: true,
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
            isHideInput: false,
            isHideList: false,
          },
          {
            id: 'buyCategory',
            name: 'どこで',
            type: 'select',
            placeholder: '-- 買う場所 --',
            icon: 'mdi-help-box',
            model: 'none',
            validates: [],
            dataList: CONST.buyCategories, // categories
            order: 3,
            isHideInput: false,
            isHideList: false,
          },
          {
            id: 'buyDueDate',
            name: 'いつまで',
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
            isHideInput: true,
            isHideList: true,
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
            isHideInput: false,
            isHideList: false,
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