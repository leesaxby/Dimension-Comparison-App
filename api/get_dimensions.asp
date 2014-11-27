<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim dimension_name

dimension_name = request("dimension_name")

Err.Clear
On Error Resume Next

  txtSQL = "select row_number() over (partition by [system], system_key order by end_date desc) as last_record, * from " & dimension_name

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
