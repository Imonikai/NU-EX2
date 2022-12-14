'use strict';

window.addEventListener('load', () => {

    const h2 = document.querySelector("h2");
    const isScorePage = (h2 !== null && h2.textContent.includes("成績照会") ) ? true : false;

    if(isScorePage === false)
    {
        chrome.runtime.onMessage.addListener((request, sender, sendReponse) => {
            sendReponse({status:"NG"});
            return true;
        });
        return;
    }
    
    const kamokuArray = document.querySelectorAll(".kamokuLevel1, .kamokuLevel2, .kamokuLevel7");   //科目名の配列を取得
    const taniArray = getShiftedArray(document.querySelectorAll(".colTani"));                       //単位数の配列を取得
    const hyokaArray = getShiftedArray(document.querySelectorAll(".colHyoka"));                     //成績評価の配列を取得

    let shutokuDic = new Object;      //授業種別をキーとして合格単位を格納する連想配列
    let rishuchuDic = new Object;     //授業種別をキーとして履修中単位を格納する連想配列
    let dicKey = new String;          //連想配列dicのキー。forループで使う
    let kamokuNameArray = [];         //科目名のリスト
    let sumHyoka = 0;                 //重み付けした評価の総数
    let sumRishu = 0;                 //合計履修数
    let sumShutoku = 0;               //合計取得単位数
    let sumRishuchu = 0;              //合計履修中単位数
    let gpa = 0;                      //GPA



    for( let i = 0; i < kamokuArray.length; i++ )
    {
        if(kamokuArray[i].textContent.includes('（必修）') || kamokuArray[i].textContent.includes('（選択）') || kamokuArray[i].textContent.includes('専門教育科目'))
        {
            //連想配列のキーを設定、存在していなかった場合は0で初期化
            dicKey = kamokuArray[i].textContent;
            if((dicKey in shutokuDic) === false)
            {
                shutokuDic[dicKey] = 0;
                rishuchuDic[dicKey] = 0;
                kamokuNameArray.push(kamokuArray[i].textContent);   
            }
        }

        const tani = Number(taniArray[i].textContent);

        //合格単位数と履修中単位数を計算する
        switch(hyokaArray[i].textContent)
        {
            case "S":
            case "A":
            case "B":
            case "C":
            case "N":
                shutokuDic[dicKey] += tani;
                sumShutoku += tani;
                break;
            case "":
                rishuchuDic[dicKey] += tani;
                sumRishuchu += tani;
                break;
        }

        //重み付けした評価の総計を計算する
        switch(hyokaArray[i].textContent)
        {
            case "S":
                sumHyoka += tani * 4;
                break;
            case "A":
                sumHyoka += tani * 3;
                break;
            case "B":
                sumHyoka += tani * 2;
                break;
            case "C":
                sumHyoka += tani;
                break;                
        }

        //合計履修数を計算する
        switch(hyokaArray[i].textContent)
        {
            case "S":
            case "A":
            case "B":
            case "C":
            case "D":
            case "A":
            case "E":
                sumRishu += Number(taniArray[i].textContent);
                break;
        }
    }

    //GPAを計算する
    gpa = Math.round((sumHyoka/sumRishu) * 100) / 100 

    //popupにレスポンス
    chrome.runtime.onMessage.addListener((request, sender, sendReponse) => {
        sendReponse(
            {
                status:"OK",
                shutokuDic:shutokuDic,
                rishuchuDic:rishuchuDic,
                kamokuNameArray:kamokuNameArray,
                sumShutoku:sumShutoku,
                sumRishuchu:sumRishuchu,
                gpa:gpa
            }
        );
        return true;
    });
    
});

function getShiftedArray( nodeList )
{
    let newArray = new Array;

    for( let i = 1; i < nodeList.length; i++ )
    {
        newArray.push(nodeList[i])
    }

    return newArray;
};