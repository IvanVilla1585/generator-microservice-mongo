# <%= appNameCapitalize %> 

## Usage
```bash
$ npm run start
```

## Default Endpoints

```js
/*
 * <%= appNameUpperCase %>  Query
 * GET /*
 * params: mongo stringify query
 *  - ?name=**&admin={$or:{ ***, *** }}
 *  - ?_id=**
 */
```

```js
/*
  * <%= appNameUpperCase %> Create
  * POST /
  * body: <%= appNameCapitalize %> fields (see validator)
  */
```

```js
/*
  * <%= appNameUpperCase %> Update
  * POST /:id
  * params: @id 
  * body: Dataset to update
  */
```

```js
/*
  * <%= appNameUpperCase %> Update status (INACTIVE)
  * POST /remove/:id
  * params: @id 
  */
 ```

