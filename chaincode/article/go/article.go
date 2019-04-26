/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
	"crypto/md5"
    "encoding/hex"
)

var lengthOfLedger int = 0;


var voterRecord []string

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Article struct {
	URL  string `json:"url"`
	Publisher  string `json:"publisher"`
	Author   string `json:"author"`
	Reliable_Score  int `json:"reliable_score"`
	Unreliable_Score  int `json:"unreliable_score"`
	Voters  []string `json:"voters"`
	Verdict   string `json:"verdict"`
}

var articles = []Article{
		Article{URL: "https://www.news18.com/", Publisher: "News 18", Author: "Paul Kurian", Reliable_Score: 5, Unreliable_Score: 4, Voters: []string{}, Verdict: "Undetermined"  },
		Article{URL: "https://www.bbc.com/", Publisher: "BBC", Author: "Paul Kurian", Reliable_Score: 2, Unreliable_Score: 2, Voters: []string{}, Verdict: "Undetermined"},
		Article{URL: "https://www.vox.com/", Publisher: "Vox", Author: "Adi Sangh", Reliable_Score: 2, Unreliable_Score: 2, Voters: []string{}, Verdict: "Undetermined"},
	}

func MD5Hash(text string) string {
    hasher := md5.New()
    hasher.Write([]byte(text))
    return hex.EncodeToString(hasher.Sum(nil))
}//Code inspired from https://gist.github.com/sergiotapia/8263278

func contains(array []string, element string) bool {
    for _, a := range array {
        if a == element {
            return true
        }
    }
    return false
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}


func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "voteGood" {
		return s.voteGood(APIstub, args)
	} else if function == "voteBad" {
		return s.voteBad(APIstub, args)
	} else if function == "queryAllArticles" {
		return s.queryAllArticles(APIstub)
	} else if function == "queryArticle" {
		return s.queryArticle(APIstub, args)
	} else if function == "addArticle" {
		return s.addArticle(APIstub, args)
	}  else if function == "queryAuthor"{
		return s.queryAuthor(APIstub, args)
	}  else if function == "queryPublisher"{
		return s.queryPublisher(APIstub, args)
	}  

	return shim.Error("Invalid Smart Contract function name.")
}



func (s *SmartContract) queryArticle(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	articleAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(articleAsBytes)
}




func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	

	i := 0
	for i < len(articles) {
		fmt.Println("i is ", i)
		articleAsBytes, _ := json.Marshal(articles[i])
		APIstub.PutState(articles[i].URL, articleAsBytes)
		fmt.Println("Added", articles[i])
		i = i + 1

	}

	lengthOfLedger = len(articles)
	fmt.Println(lengthOfLedger)


	return shim.Success(nil)
}
func (s *SmartContract) addArticle(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	

	var article = Article{URL: args[0], Publisher: args[1],Author: args[2], Reliable_Score: 0, Unreliable_Score: 0, Voters: []string{}, Verdict: "Undetermined" }

	articleAsBytes, _ := json.Marshal(article)
	APIstub.PutState(args[0], articleAsBytes)
	lengthOfLedger = lengthOfLedger + 1
	articles=append(articles,article)
	return shim.Success(nil)
}




func (s *SmartContract) queryAllArticles(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := ""
	endKey := ""

	fmt.Println("ENDKEY"+endKey)

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllScores:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


func (s *SmartContract) voteGood(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	articleAsBytes, _ := APIstub.GetState(args[0])
	article := Article{}
	json.Unmarshal(articleAsBytes, &article)



	if contains(article.Voters, MD5Hash("article"+args[1])) == false {
		
		article.Reliable_Score = article.Reliable_Score + 1

		article.Voters = append(article.Voters, MD5Hash("article"+args[1]))

		if (article.Reliable_Score<=int((2*article.Unreliable_Score)/3)){
			article.Verdict="Unreliable"
		} else if (article.Unreliable_Score<=int((2*article.Reliable_Score)/3)){
			article.Verdict="Reliable"
		} else{
			article.Verdict="Undetermined"
		}

		
		
		articleAsBytes, _ = json.Marshal(article)
		APIstub.PutState(args[0], articleAsBytes)
		
	} else {
		return shim.Error("User: "+args[1]+" has already voted")
	}
	
	
	return shim.Success(nil)
}
func (s *SmartContract) voteBad(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	articleAsBytes, _ := APIstub.GetState(args[0])
	article := Article{}
	json.Unmarshal(articleAsBytes, &article)



	if contains(article.Voters, MD5Hash("article"+args[1])) == false {
		
		article.Unreliable_Score = article.Unreliable_Score + 1

		article.Voters = append(article.Voters, MD5Hash("article"+args[1]))

		if (article.Reliable_Score<=int((2*article.Unreliable_Score)/3)){
			article.Verdict="Unreliable"
		} else if (article.Unreliable_Score<=int((2*article.Reliable_Score)/3)){
			article.Verdict="Reliable"
		} else{
			article.Verdict="Undetermined"
		}

		
		
		articleAsBytes, _ = json.Marshal(article)
		APIstub.PutState(args[0], articleAsBytes)
		
	} else {
		return shim.Error("User: "+args[1]+" has already voted")
	}
	
	
	return shim.Success(nil)
}



func (s *SmartContract) queryAuthor(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	startKey := ""
	endKey := ""

	fmt.Println("ENDKEY"+endKey)

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()



	authorScore := 0
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		article := Article{}
		json.Unmarshal(queryResponse.Value, &article)
		fmt.Println(article.URL)
		if article.Author == args[0] {
			fmt.Println("HI"+strconv.Itoa(article.Reliable_Score - article.Unreliable_Score))

			authorScore = authorScore + article.Reliable_Score - article.Unreliable_Score
		}
	}
	var buffer bytes.Buffer
	buffer.WriteString("Author Score: "+strconv.Itoa(authorScore))

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryPublisher(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

		if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	startKey := ""
	endKey := ""

	fmt.Println("ENDKEY"+endKey)

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()



	publisherScore := 0
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		article := Article{}
		json.Unmarshal(queryResponse.Value, &article)
		fmt.Println(article.URL)
		if article.Publisher == args[0] {
			fmt.Println("HI"+strconv.Itoa(article.Reliable_Score - article.Unreliable_Score))

			publisherScore = publisherScore + article.Reliable_Score - article.Unreliable_Score
		}
	}
	var buffer bytes.Buffer
	buffer.WriteString("Publisher Score: "+strconv.Itoa(publisherScore))

	return shim.Success(buffer.Bytes())
}


// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
