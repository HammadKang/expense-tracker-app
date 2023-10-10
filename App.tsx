/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useMemo, useState, useId, useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableHighlight,
  TouchableNativeFeedback,
  Modal,
  ModalProps,
  ToastAndroid,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import LinearGradient from 'react-native-linear-gradient';
type SectionProps = PropsWithChildren<{
  title: string;
}>;
import Icon from 'react-native-vector-icons/Entypo';
import IonIcon from 'react-native-vector-icons/Ionicons';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import MyModal from './src/components/AddExpense';
import {storage} from './src/Storage';

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}
function getLastDateOfMonth(year: number, month: number) {
  // Ensure month is within the range 0-11
  month = Math.max(0, Math.min(11, month));

  // Create a new Date object for the last day of the specified month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    first: firstDay.toISOString(),
    last: lastDay.toISOString(),
  };
}
type category = {
  icon: React.JSX.Element;
  title: string;
  color: string;
};
type CategoriesType = {
  [key: string]: category;
};
const createCategories = <M extends CategoriesType>(cat: M) => cat;
const Categories = createCategories({
  Food: {
    icon: <IonIcon name="fast-food-outline" size={18} color={'white'} />,
    title: 'Food',
    color: '#F7DD47',
  },
  Drink: {
    icon: <FA5 name="wine-glass-alt" size={18} color={'white'} />,
    title: 'Drink',
    color: '#750707',
  },
  Gift: {
    icon: <IonIcon name="gift-outline" size={18} color={'white'} />,
    title: 'Gift',
    color: '#EC4A93',
  },
  Petrol: {
    icon: <FA5 name="gas-pump" size={18} color={'white'} />,
    title: 'Petrol',
    color: '#E76937',
  },
  Snacks: {
    icon: <MCI name="french-fries" size={18} color={'white'} />,
    title: 'Snacks',
    color: '#F1B21F',
  },
  Shopping: {
    icon: <MCI name="cart-outline" size={18} color={'white'} />,
    title: 'Shopping',
    color: '#25EBDE',
  },
  Mechanic: {
    icon: <MCI name="car-wrench" size={18} color={'white'} />,
    title: 'Mechanic',
    color: '#2D2D2D',
  },
  Mobile: {
    icon: <IonIcon name="phone-portrait-outline" size={18} color={'white'} />,
    title: 'Mobile Phone',
    color: '#563AB9',
  },
  Bills: {
    icon: <IonIcon name="receipt-outline" size={18} color={'white'} />,
    title: 'Utility Bills',
    color: '#00853A',
  },
  Car: {
    icon: <MCI name="car-side" size={18} color={'white'} />,
    title: 'Car',
    color: '#1666C7',
  },
  Others: {
    icon: <MCI name="information-variant" size={18} color={'white'} />,
    title: 'Others',
    color: '#F95C5C',
  },
});

type Expense = {
  amount: number;
  description: string;
  datetime: string;
  category: category | string;
  date: string;
};
// interface DateCat extends Expense {
//   date: string;
// }
// const DataWithdate: DateCat = TryDat.map(exp => ({
//   ...exp,
//   date: exp.datetime.slice(0, 10),
// }));

/*
[
  {
    amount: 300,
    category: Categories.Food,
    description: 'Lunch',
    datetime: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
  },
  {
    amount: 5000,
    category: Categories.Food,
    description: 'Fuel Dayz',
    datetime: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
  },
  {
    amount: 53400,
    category: Categories.Food,
    description: 'Fuel Dayz',
    datetime: new Date('2023-10-02T18:55:27.859Z').toISOString(),
    date: new Date('2023-10-02T18:55:27.859Z').toISOString().slice(0, 10),
  },
  {
    amount: 3000,
    category: Categories.Food,
    description: 'Fuel Dayz',
    datetime: new Date('2023-10-01T18:55:27.859Z').toISOString(),
    date: new Date('2023-10-01T18:55:27.859Z').toISOString().slice(0, 10),
  },
  {
    amount: 2000,
    category: Categories.Petrol,
    description: 'Fuel Dayz',
    datetime: new Date('2023-10-01T18:55:27.859Z').toISOString(),
    date: new Date('2023-10-01T18:55:27.859Z').toISOString().slice(0, 10),
  },
];
*/
const DATE_OBJ = new Date();
const MonthRange = getLastDateOfMonth(
  DATE_OBJ.getFullYear(),
  DATE_OBJ.getMonth(),
);
const options: Intl.DateTimeFormatOptions = {day: '2-digit', month: 'short'};
const firstDate = new Date(MonthRange.first).toLocaleDateString(
  'en-UK',
  options,
);
const lastDate = new Date(MonthRange.last).toLocaleDateString('en-UK', options);
const num = 0;
// const ARR2 = ['HELLO', 'WORLD', 'WORLD', 'HELLO', 'WORLD', 'WORLD'];
// const ARR = ['HELLO', 'WORLD'];
const getTotalExpense = (arr: Expense[]) => {
  return arr.reduce(
    (prev, curr) => prev + parseFloat(curr.amount.toString()),
    0,
  );
};
// console.log(getTotalExpense(TryDat));

const getUpdatedData = () => {
  let data = storage.getString('UserExpense');
  const ExpData: Expense[] = JSON.parse(data || '') || [];
  let TryDat: Array<Expense> = ExpData.map(val => ({
    ...val,
    category: Categories[val.category],
  }));
  const result: {[key: string]: Expense[]} = {};

  TryDat.forEach(item => {
    const datetime = item.date;
    if (!result[datetime]) {
      result[datetime] = [];
    }
    result[datetime].push(item);
  });
  const DATES = Object.keys(result);
  // console.log('DATA UPDATED', JSON.stringify(ExpData, null, 3));

  return {DATES, result, ExpData};
};

function getStandardTime(datetimeString: string) {
  let date = new Date(datetimeString);
  var hours = date.getHours();
  var minutes: string | number = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
function App(): JSX.Element {
  const [isAddExpense, setIsAddExpense] = useState<boolean>(false);
  const [toggleDataUpd, setToggleDataUpd] = useState<boolean>(false);
  const {DATES, result, ExpData} = useMemo(
    () => getUpdatedData(),
    [isAddExpense, toggleDataUpd],
  );

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        // barStyle={'dark-content'}
      />
      <LinearGradient
        colors={['#3585CC', '#13A9B6', '#5FBED8']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{
          height: 196,
          width: '100%',
          backgroundColor: 'blue',
          alignSelf: 'center',
          // borderRadius: 24,
          padding: 24,
          paddingTop: 48,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}>
        <Text style={{fontWeight: 'bold', color: '#FFFFFFD7', fontSize: 18}}>
          My Monthly Expense
        </Text>
        <Text style={{fontWeight: '900', color: '#FFF9FF', fontSize: 16}}>
          {firstDate} - {lastDate}
        </Text>

        <View
          style={{
            marginTop: 'auto',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          <Text style={{color: '#FFFFFF', fontSize: 14}}>You have Spent: </Text>
          <Text style={{fontWeight: '900', color: '#FFFFFF', fontSize: 24}}>
            PKR {getTotalExpense(ExpData).toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
      <View style={{flex: 1, padding: 20, paddingTop: 0}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 80}}>
          {DATES.reverse().map(dt => {
            return (
              <LinearGradient
                colors={['#959595', '#5E5E5E']}
                key={dt}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 0}}
                style={{
                  backgroundColor: 'grey',
                  marginVertical: 20,
                  padding: 8,
                  borderRadius: 8,
                }}>
                <Text style={{color: 'white', fontWeight: '500'}}>
                  {new Date(dt).toDateString()}
                </Text>
                {result[dt].map((expenses, ind) => {
                  return (
                    <View
                      key={`${expenses.description} ${ind}`}
                      style={{
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        flexDirection: 'row',
                        margin: 8,
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          width: '12%',
                          textAlign: 'center',
                          color: 'white',
                        }}>
                        {getStandardTime(expenses.datetime)}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onLongPress={() => {
                          Alert.alert(
                            `Delete this Expense?`,
                            `Are you sure you want to delete "${expenses?.description.slice(
                              0,
                              20,
                            )}${
                              expenses?.description?.length > 20 ? '...' : ''
                            }"`,
                            [
                              {
                                text: 'Cancel',
                              },
                              {
                                text: 'Yes, Delete',
                                onPress: v => {
                                  //  const selectedInd =
                                  // console.log('EXPPPP');
                                  // console.log(
                                  //   JSON.stringify(expenses, null, 3),
                                  // );
                                  // console.log('EXPPPP');

                                  // console.log('AFTER FITER');

                                  const updateData = ExpData.filter(
                                    ex =>
                                      !(
                                        ex.description ===
                                          expenses.description &&
                                        ex.datetime === expenses.datetime
                                      ),
                                  );
                                  // console.log(
                                  //   JSON.stringify(updateData, null, 3),
                                  // );
                                  // console.log('AFTER FITER');
                                  storage.set(
                                    'UserExpense',
                                    JSON.stringify(updateData),
                                  );
                                  setToggleDataUpd(tg => !tg);
                                  // console.log(expenses);
                                  // console.log(result);
                                },
                              },
                            ],
                          );
                        }}
                        style={{
                          backgroundColor: (expenses.category as category)
                            .color,
                          height: 35,
                          width: 35,
                          borderRadius: 1000,
                          padding: 8,
                          marginLeft: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {(expenses.category as category).icon}
                      </TouchableOpacity>
                      <View
                        style={{
                          marginHorizontal: 16,
                          // backgroundColor: 'blue',
                          // flexWrap: 'wrap',
                          // flexDirection: 'row',
                          // width: 'auto',
                          flex: 1.5,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'white',
                            width: 'auto',
                          }}>
                          {expenses.description}
                        </Text>
                        <Text style={{color: 'white', fontSize: 12}}>
                          {expenses.category.title}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginLeft: 'auto',
                          color: 'white',
                          // backgroundColor: 'red',
                          // flex: 1,
                          textAlign: 'right',
                          // width: ,
                        }}>
                        PKR{' '}
                        {parseFloat(
                          expenses.amount.toString(),
                        ).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </LinearGradient>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          height: 76,
          alignItems: 'center',
          width: 76,
          justifyContent: 'center',
          margin: 24,
          marginLeft: 'auto',
          marginTop: 'auto',
          borderRadius: 40,
          overflow: 'hidden',
          position: 'absolute',
          bottom: 0,
          right: 0,
          // backgroundColor: 'green',
        }}>
        <TouchableNativeFeedback
          onPress={e => {
            // console.log(Object.keys(result));
            setIsAddExpense(true);
          }}>
          <View
            style={{
              backgroundColor: '#3585CC',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="plus" size={32} color={'#fff'} />
          </View>
        </TouchableNativeFeedback>
      </View>
      <MyModal
        isVisible={isAddExpense}
        onClose={() => {
          setIsAddExpense(false);
        }}
        handleSave={(inp1, inp2, category) => {
          if (inp1 && inp2 && category) {
            const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
            const dt = new Date(Date.now() - tzoffset);
            const OBJ: Expense = {
              amount: inp1,
              category: category,
              datetime: dt.toISOString(),
              date: dt.toISOString().slice(0, 10),
              description: inp2,
            };
            // console.log();
            const val = storage.getString('UserExpense');
            let ExpenseArr: Expense[];
            if (val) {
              ExpenseArr = JSON.parse(val);
            } else {
              ExpenseArr = new Array();
            }
            ExpenseArr.push(OBJ);
            storage.set('UserExpense', JSON.stringify(ExpenseArr));
            ToastAndroid.show('Saved successfully', 500);
            setIsAddExpense(false);
          }
        }}
      />
    </View>
  );
}
const AddExpenseModal: (val: ModalProps) => React.JSX.Element = () => (
  <Modal>
    <Text style={{color: 'black'}}>HELLO WORKD</Text>
  </Modal>
);
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  linearGradient: {flex: 1, paddingLeft: 15, paddingRight: 15, borderRadius: 5},
});

export default App;
/*
 <View
          style={{
            height: 100,
            // width: 30,
            backgroundColor: 'lightgray',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                height: 50,
                width: 50,
                backgroundColor: 'red',
                borderRadius: 100,
                zIndex: 20,
              }}></View>
            {/* <View
            style={{
              height: 1,
              width: 10,
              backgroundColor: 'black',
              right: 2,
            }}></View> */
//     <View
//       style={{
//         borderWidth: 1,
//         // width: 1,
//         height: 20 * ARR.length + 20 * ARR.length - 38,
//         // backgroundColor: 'red',
//       }}></View>
//   </View>
//   {/* <View
//     style={{
//       // height: ARR.length === 1 ? 0 : 20 * ARR.length,
//       borderWidth: 1,
//       width: 1,
//       height: 20 * ARR.length + 20 * ARR.length - 38,
//       // width: 20,
//       // height: 20 * ARR.length + 20 * ARR.length - 38,
//     }}></View> */}
//   <View
//     style={{
//       // height: ARR.length === 1 ? 0 : 10 * ARR.length,
//       // height: ARR.length === 1 ? 0 : 10 * ARR.length,
//       // flexGrow: 1,
//       width: 300,
//       // backgroundColor: 'grey',
//       alignItems: 'flex-start',
//       // justifyContent: 'center',
//       // overflow: 'hidden',
//       // flexDirection: 'column',

//       // justifyContent: 'space-between',
//     }}>
//     {ARR.map(val => (
//       <View
//         style={{
//           // height: 20,
//           // width: 80,
//           // backgroundColor: 'blue',
//           // width: 100,

//           // backgroundColor: 'blue',
//           flexDirection: 'row',
//           justifyContent: 'center',
//           alignItems: 'center',
//           // marginTop: 20,
//         }}>
//         <View
//           style={{
//             // height: 1,
//             width: 40,
//             // backgroundColor: 'black',
//             flexDirection: 'column',
//             alignItems: 'center',
//             borderWidth: 1,
//           }}></View>
//         <View style={{marginVertical: 10, height: 20}}>
//           <Text
//             style={{
//               color: 'black',
//               fontSize: 12,
//               alignItems: 'center',
//             }}>
//             {val}
//           </Text>
//         </View>
//       </View>
//     ))}
//   </View>
// </View>
// <View
//   style={{
//     width: '100%',
//     flex: 1,
//     flexDirection: 'row',

//     justifyContent: 'center',
//     alignItems: 'center',
//   }}>
//   <View
//     style={{
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       // backgroundColor: 'grey',
//     }}>
//     <View
//       style={{
//         borderWidth: 1,
//         height: 50,
//         width: 50,
//         borderRadius: 25,
//       }}></View>
//     {/* <View style={{height: 1, width: 50, borderWidth: 1}}></View> */}

//     <View
//       style={{
//         borderWidth: 1,
//         // width: 1,
//         height: 20 * ARR.length + 20 * ARR.length - 38,
//         // backgroundColor: 'red',
//       }}></View>
//   </View>

//   <View style={{}}>
//     {ARR.map(el => {
//       return (
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           <View style={{borderWidth: 1, width: 40, height: 1}}></View>

//           <View
//             style={{
//               // borderWidth: 1,
//               marginVertical: 10,
//               width: 60,
//               height: 20,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <Text>{el}</Text>
//           </View>
//         </View>
//       );
//     })}
//   </View>
// </View>
