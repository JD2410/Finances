#Simple Finance App

This is a simple finance app for tracking both my savings accounts and investments. Utilising Highcharts for visuak representation and Django as the back and front end.


#Developer Note

On the page you can make the first column collapsible by adding the class collapsibe to the content--main

```
<div class="content--header">
    <h1>Savings</h1>
    <button class='button primary'>Create Savings Account</button>
</div>
<div class="content--main collapsibe">
    <div class="main--container">
        <div class="container--header">
            <h2>All Transactions</h2>
        </div>
        <div class="container--content">
        </div>
    </div>
    <div class="main--container">
        <div class="container--header">
            <h2>All Transactions</h2>
        </div>
        <div class="container--content">
        </div>
    </div>
</div>

```

This can be actioned by adding the. class 'toggle-container-sidebar"' to an element