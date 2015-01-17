<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim dimension_name, fieldName, keyword, minRec, maxRec, jsonStr

dimension_name = request("dimension_name")
keyword = request("keyword")
minRec = request("minRec")
maxRec = request("maxRec")
fieldName = request("field_name")

Err.Clear
On Error Resume Next

  txtSQL = "sp_dim_search '" & dimension_name & "','" & fieldName & "','" & keyword & "', " & minRec & ", " & maxRec & " "

  jsonStr = QueryToJSON(Conn,txtSQL).Flush

  response.ContentType = "application/json"
  response.write jsonStr

If Err.Number <> 0 Then

  member("errorMsg") = Err.Description
  member.Flush
  response.ContentType = "application/json"
  response.write member

End If
On Error GoTo 0

%>
