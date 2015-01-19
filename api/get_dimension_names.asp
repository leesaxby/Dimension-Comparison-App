<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim dimension_name, jsonStr

Err.Clear
On Error Resume Next

  txtSQL = "declare @query_text varchar(8000) " _
          &"set @query_text = (select substring((select table_name AS [text()] " _
          &"FROM (SELECT ' union select ''' + table_name + ''' as table_name, count(*) as record_count from ' + table_name as table_name FROM INFORMATION_SCHEMA.TABLES where table_name like 'dim_%' and table_type = 'BASE TABLE' " _
          &") sq order by table_name desc " _
          &"FOR XML PATH('')),7,8000)) " _
          &"exec (@query_text) "

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
