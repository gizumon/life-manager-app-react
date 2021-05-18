/**
 * CONST values
 */
type ICategory = {
    id: string;
    name: string;
    setting: IRatioSetting[];
};

type IRatioSetting = {
    memberId: String;
    ratio: Number;
};

namespace CONST {
    // Category for display list
    export const category: ICategory[] = [
        {
          id: 'none',
          name: '指定なし',
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
}
  
export default CONST