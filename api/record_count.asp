<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim dimension_name, fieldName, keyword, i

i = 0

dimension_name = request("dimension_name")
fieldName = request("field_name")
keyword = request("keyword")


txtSQL = "sp_dim_search '" & dimension_name & "','" & fieldName & "','" & keyword & "', 1, 999999 "
rs.open txtSQL,conn,3,1
do while not rs.eof
  i=i+1
rs.movenext
loop

response.write i

%>
