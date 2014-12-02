<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<%
dim id, dimension_name

id = Request("id")
dimension_name = Request("dimension_name")

Err.Clear
On Error Resume Next

  txtSql = "DELETE FROM " & dimension_name & " WHERE id = '" & id & "'"
  conn.execute txtSQL

If Err.Number <> 0 Then

  response.write Err.Description

End If
On Error GoTo 0

%>
